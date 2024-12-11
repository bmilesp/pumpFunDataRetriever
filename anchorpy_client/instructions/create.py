from __future__ import annotations
import typing
from solders.pubkey import Pubkey
from solders.system_program import ID as SYS_PROGRAM_ID
from solders.sysvar import RENT
from spl.token.constants import TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
from solders.instruction import Instruction, AccountMeta
import borsh_construct as borsh
from ..program_id import PROGRAM_ID


class CreateArgs(typing.TypedDict):
    name: str
    symbol: str
    uri: str


layout = borsh.CStruct(
    "name" / borsh.String, "symbol" / borsh.String, "uri" / borsh.String
)


class CreateAccounts(typing.TypedDict):
    mint: Pubkey
    mint_authority: Pubkey
    bonding_curve: Pubkey
    associated_bonding_curve: Pubkey
    global_: Pubkey
    mpl_token_metadata: Pubkey
    metadata: Pubkey
    user: Pubkey
    event_authority: Pubkey
    program: Pubkey


def create(
    args: CreateArgs,
    accounts: CreateAccounts,
    program_id: Pubkey = PROGRAM_ID,
    remaining_accounts: typing.Optional[typing.List[AccountMeta]] = None,
) -> Instruction:
    keys: list[AccountMeta] = [
        AccountMeta(pubkey=accounts["mint"], is_signer=True, is_writable=True),
        AccountMeta(
            pubkey=accounts["mint_authority"], is_signer=False, is_writable=False
        ),
        AccountMeta(
            pubkey=accounts["bonding_curve"], is_signer=False, is_writable=True
        ),
        AccountMeta(
            pubkey=accounts["associated_bonding_curve"],
            is_signer=False,
            is_writable=True,
        ),
        AccountMeta(pubkey=accounts["global_"], is_signer=False, is_writable=False),
        AccountMeta(
            pubkey=accounts["mpl_token_metadata"], is_signer=False, is_writable=False
        ),
        AccountMeta(pubkey=accounts["metadata"], is_signer=False, is_writable=True),
        AccountMeta(pubkey=accounts["user"], is_signer=True, is_writable=True),
        AccountMeta(pubkey=SYS_PROGRAM_ID, is_signer=False, is_writable=False),
        AccountMeta(pubkey=TOKEN_PROGRAM_ID, is_signer=False, is_writable=False),
        AccountMeta(
            pubkey=ASSOCIATED_TOKEN_PROGRAM_ID, is_signer=False, is_writable=False
        ),
        AccountMeta(pubkey=RENT, is_signer=False, is_writable=False),
        AccountMeta(
            pubkey=accounts["event_authority"], is_signer=False, is_writable=False
        ),
        AccountMeta(pubkey=accounts["program"], is_signer=False, is_writable=False),
    ]
    if remaining_accounts is not None:
        keys += remaining_accounts
    identifier = b"\x18\x1e\xc8(\x05\x1c\x07w"
    encoded_args = layout.build(
        {
            "name": args["name"],
            "symbol": args["symbol"],
            "uri": args["uri"],
        }
    )
    data = identifier + encoded_args
    return Instruction(program_id, data, keys)
