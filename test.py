from solana.rpc.api import Client
from solders.pubkey import Pubkey
from pprint import pprint
import time

all_addresses = [
    Pubkey.from_string('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P') #pump.fun
]

#endpoint = 'https://api.devnet.solana.com'    # probably for `developing`
#endpoint = 'https://api.testnet.solana.com'   # probably for `testing`
#endpoint = 'https://api.mainnet-beta.solana.com' #rate limited
endpoint = 'https://aura-mainnet.metaplex.com/'
#endpoint = 'https://solana-api.projectserum.com'

solana_client = Client(endpoint)


for address in all_addresses:
    print('address:', address)
    
    #result = solana_client.get_confirmed_signature_for_address2(address, limit=1)
    result = solana_client.get_signatures_for_address(address, None, None, 5)#, before='89Tv9s2uMGaoxB8ZF1LV9nGa72GQ9RbkeyCDvfPviWesZ6ajZBFeHsTPfgwjGEnH7mpZa7jQBXAqjAfMrPirHt2')
   
    for row in result.value:
        #pprint(row)
        pprint(row.confirmation_status)
        pprint(row.signature)
        txns =solana_client.get_transaction(row.signature, "json", None, 0)
        #pprint(txns)
        # I use `[:5]` to display only first 5 values
        #for number, item in enumerate(result['result'][:5], 1):
        #    print(number, 'signature:', item['signature'])

        # check if there is `4SNQ4h1vL9GkmSnojQsf8SZyFvQsaq62RCgops2UXFYag1Jc4MoWrjTg2ELwMqM1tQbn9qUcNc4tqX19EGHBqC5u`
        #for number, item in enumerate(row, 1):
        #    if item['signature'].startswith('4SN'):
        #        print('found at', number, '>>>', item['signature'])
        #time.sleep(3)
    else:
        # error message 
        print("error")
        print(row)

    print('---')

    #solana_client.get_account_info(address)