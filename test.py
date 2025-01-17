from solana.rpc.api import Client
from solders.pubkey import Pubkey
from pprint import pprint
import time
import json

all_addresses = [
    Pubkey.from_string('TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM') #pump.fun token authority address
]

#endpoint = 'https://api.devnet.solana.com'    # probably for `developing`
#endpoint = 'https://api.testnet.solana.com'   # probably for `testing`
#endpoint = 'https://api.mainnet-beta.solana.com' #rate limited
endpoint = 'https://aura-mainnet.metaplex.com/'
#endpoint = 'https://solana-api.projectserum.com'

solana_client = Client(endpoint)
queryFromSig = None
currentBatchRows = rowsPerBatch = 10 #number of rows per batch
maxRows = 10

for address in all_addresses:
    #print('address:', address)
    while currentBatchRows < maxRows:
        #print('currentBatchRows:', currentBatchRows)
        #print('queryFromSig:', queryFromSig)
        #pprint(address)
        result = solana_client.get_signatures_for_address(address, queryFromSig, None, rowsPerBatch)#, before='89Tv9s2uMGaoxB8ZF1LV9nGa72GQ9RbkeyCDvfPviWesZ6ajZBFeHsTPfgwjGEnH7mpZa7jQBXAqjAfMrPirHt2')
        pprint(json.loads(result.to_json()))
        if len(result.value) == 0:
            break
        for row in result.value:
            if row.confirmation_status != 'finalized' and row.err == None:
                pprint(row.signature)
                txns =solana_client.get_transaction(row.signature, "json", None, 0)
                pprint("total txns: ", len(txns))
                #pprint(txns.value.transaction.meta)
                pprint(txns.value)
                jsonData = json.loads(json.dumps(txns.to_json()))
                
                #del jsonData['result']['meta'].logMessages
                print(jsonData)
                # I use `[:5]` to display only first 5 values
                #for number, item in enumerate(result['result'][:5], 1):
                #    print(number, 'signature:', item['signature'])

                # check if there is `4SNQ4h1vL9GkmSnojQsf8SZyFvQsaq62RCgops2UXFYag1Jc4MoWrjTg2ELwMqM1tQbn9qUcNc4tqX19EGHBqC5u`
                #for number, item in enumerate(row, 1):
                #    if item['signature'].startswith('4SN'):
                #        print('found at', number, '>>>', item['signature'])
                #time.sleep(3)
                queryFromSig = row.signature
                currentBatchRows += 1
                time.sleep(0.5)
            print('---')
    print('last Sig:', queryFromSig)
print('done')