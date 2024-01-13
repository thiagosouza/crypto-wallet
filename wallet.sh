#!/bin/bash
# 
# This is free and unencumbered software released into the public domain.
#
# Requires bc, dc, openssl, xxd
#
# by grondilu from https://bitcointalk.org/index.php?topic=10970.msg156708#msg156708

base58=({1..9} {A..H} {J..N} {P..Z} {a..k} {m..z})
bitcoinregex="^[$(printf "%s" "${base58[@]}")]{34}$"

if [ `uname -s` = 'Darwin' ]; then
  TAC="tail -r "
else
  TAC="tac"
fi

decodeBase58() {
    local s=$1
    for i in {0..57}
    do s="${s//${base58[i]}/ $i}"
    done
    dc <<< "16o0d${s// /+58*}+f" 
}

encodeBase58() {
    # 58 = 0x3A
    echo -n "$1" | sed -e's/^\(\(00\)*\).*/\1/' -e's/00/1/g' | tr -d '\n'
    dc -e "16i ${1^^} [3A ~r d0<x]dsxx +f" |
    while read -r n; do echo -n "${base58[n]}"; done
}

checksum() {
    xxd -p -r <<<"$1" |
    openssl dgst -sha256 -binary |
    openssl dgst -sha256 -binary |
    xxd -p -c 80 |
    head -c 8
}

checkBitcoinAddress() {
    if [[ "$1" =~ $bitcoinregex ]]
    then
        h=$(decodeBase58 "$1")
        checksum "00${h::${#h}-8}" |
        grep -qi "^${h: -8}$"
    else return 2
    fi
}

hash160() {
    openssl dgst -sha256 -binary |
    openssl dgst -rmd160 -binary |
    xxd -p -c 80
}

hash160ToAddress() {
    printf "%34s\n" "$(encodeBase58 "00$1$(checksum "00$1")")" |
    sed "y/ /1/"
}

publicKeyToAddress() {
    hash160ToAddress $(
    openssl ec -pubin -pubout -outform DER |
    tail -c 65 |
    hash160
    )
}

echo -n "Public key: "
openssl ecparam -name secp256k1 -genkey | tee priv.pem | openssl ec -pubout | publicKeyToAddress
echo ""
echo -n "Private key: "
cat priv.pem
echo ""
