#!/usr/bin/env python3

import os
import json
from Crypto.Hash import CMAC
from Crypto.Cipher import AES
from Crypto.PublicKey import RSA
from Crypto.Signature import pkcs1_15

CMAC_KEY = bytes.fromhex('2b7e1516 28aed2a6 abf71588 09cf4f3c')

def mac(msg):
    cmac = CMAC.new(CMAC_KEY, ciphermod=AES)
    cmac.oid = '2.16.840.1.101.3.4.2.42'
    cmac.update(msg)
    return cmac

key_size_bits = 2048

e = 0x10001
rsa_key = RSA.generate(key_size_bits)
assert rsa_key.e == e

n_bytes = rsa_key.n.to_bytes(key_size_bits//8)

pubkey_tag_hex = mac(n_bytes).hexdigest()

signer = pkcs1_15.new(rsa_key)

payload = os.urandom(128)

signature = signer.sign(mac(payload))

package = {
    'payload': payload.hex(),
    'pubkey': n_bytes.hex(),
    'signature': signature.hex()
}

with open('generated.py', 'w') as generated_f:
    generated_f.write(f"PUBKEY_TAG = bytes.fromhex('{pubkey_tag_hex}')\n")

with open('update.json', 'w') as update_f:
    json.dump(package, update_f)

print(f'{pubkey_tag_hex=}')
print(f'{mac(payload).hexdigest()=}')
