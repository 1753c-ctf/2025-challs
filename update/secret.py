import os
from generated import PUBKEY_TAG

FLAG = os.environ.get('flag', 'something went wrong, please contact organizers')
CMAC_KEY = bytes.fromhex('2b7e1516 28aed2a6 abf71588 09cf4f3c')

def try_read_cmac_key():
    return f"Wasn't easy, but with help from your friend with a scanning electron microscope you managed: {CMAC_KEY.hex()}"
