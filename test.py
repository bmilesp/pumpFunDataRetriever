import asyncio
from solana.rpc.async_api import AsyncClient
from solders.pubkey import Pubkey
from anchorpy import Program, Provider, Wallet


async def main():
    client = AsyncClient("https://api.mainnet-beta.solana.com/")
    provider = Provider(client, Wallet.local())
    # load the Serum Swap Program (not the Serum dex itself).
    program_id = Pubkey.from_string("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P")
    program = await Program.at(
        program_id, provider
    )
    print(program.idl.name)  # swap
    await program.close()


asyncio.run(main())
