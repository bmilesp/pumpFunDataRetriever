from solana.rpc.api import Client
from solana.transaction import Transaction
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from anchorpy import Provider
#from anchorpy_client.instructions import pump_fun_instruction
from anchorpy_client.accounts import Global
from pprint import pprint
import asyncio

all_addresses = [
    Pubkey.from_string('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P') #pump.fun
]

#endpoint = 'https://api.devnet.solana.com'    # probably for `developing`
#endpoint = 'https://api.testnet.solana.com'   # probably for `testing`
endpoint = 'https://api.mainnet-beta.solana.com'
#endpoint = 'https://solana-api.projectserum.com'

solana_client = Client(endpoint)

async def get_program(endpoint, address) -> asyncio.coroutine:
  acc = await Global.fetch(endpoint, address)
  pprint(acc)
  if acc is None:
    # the fetch method returns null when the account is uninitialized
    raise ValueError("account not found")
    # convert to a JSON object
    #obj = acc.to_json()


asyncio.run(get_program(endpoint, all_addresses[0]))
print('done')



# convert to a JSON object


# load from JSON
#acc_from_json = Global.from_json(acc)


#for address in all_addresses:
    #print('address:', address)
    
    #result = solana_client.get_confirmed_signature_for_address2(address, limit=1)
    #result = solana_client.get_signatures_for_address(address, None, None, 5)#, before='89Tv9s2uMGaoxB8ZF1LV9nGa72GQ9RbkeyCDvfPviWesZ6ajZBFeHsTPfgwjGEnH7mpZa7jQBXAqjAfMrPirHt2')
    #result =solana_client.get_account_info(address)
    #pprint(result)
    #for row in result.value:
    #    pprint('row')
        # I use `[:5]` to display only first 5 values
        #for number, item in enumerate(result['result'][:5], 1):
        #    print(number, 'signature:', item['signature'])

        # check if there is `4SNQ4h1vL9GkmSnojQsf8SZyFvQsaq62RCgops2UXFYag1Jc4MoWrjTg2ELwMqM1tQbn9qUcNc4tqX19EGHBqC5u`
        #for number, item in enumerate(row, 1):
        #    if item['signature'].startswith('4SN'):
        #        print('found at', number, '>>>', item['signature'])

    #else:
        # error message 
    #   print("error")

    #print('---')

    #solana_client.get_account_info(address)