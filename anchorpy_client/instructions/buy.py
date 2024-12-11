from __future__ import annotations
import typing
from solders.pubkey import Pubkey
from solders.system_program import ID as SYS_PROGRAM_ID
from solders.sysvar import RENT
from spl.token.constants import TOKEN_PROGRAM_ID
from solders.instruction import Instruction, AccountMeta
import borsh_construct as borsh
from ..program_id import PROGRAM_ID


class BuyArgs(typing.TypedDict):
    amount: int
    max_sol_cost: int


layout = borsh.CStruct("amount" / borsh.U64, "max_sol_cost" / borsh.U64)


class BuyAccounts(typing.TypedDict):
    global_: Pubkey
    fee_recipient: Pubkey
    mint: Pubkey
    bonding_curve: Pubkey
    associated_bonding_curve: Pubkey
    associated_user: Pubkey
    user: Pubkey
    event_authority: Pubkey
    program: Pubkey


def buy(
    args: BuyArgs,
    accounts: BuyAccounts,
    program_id: Pubkey = PROGRAM_ID,
    remaining_accounts: typing.Optional[typing.List[AccountMeta]] = None,
) -> Instruction:
    keys: list[AccountMeta] = [
        AccountMeta(pubkey=accounts["global_"], is_signer=False, is_writable=False),
        AccountMeta(
            pubkey=accounts["fee_recipient"], is_signer=False, is_writable=True
        ),
        AccountMeta(pubkey=accounts["mint"], is_signer=False, is_writable=False),
        AccountMeta(
            pubkey=accounts["bonding_curve"], is_signer=False, is_writable=True
        ),
        AccountMeta(
            pubkey=accounts["associated_bonding_curve"],
            is_signer=False,
            is_writable=True,
        ),
        AccountMeta(
            pubkey=accounts["associated_user"], is_signer=False, is_writable=True
        ),
        AccountMeta(pubkey=accounts["user"], is_signer=True, is_writable=True),
        AccountMeta(pubkey=SYS_PROGRAM_ID, is_signer=False, is_writable=False),
        AccountMeta(pubkey=TOKEN_PROGRAM_ID, is_signer=False, is_writable=False),
        AccountMeta(pubkey=RENT, is_signer=False, is_writable=False),
        AccountMeta(
            pubkey=accounts["event_authority"], is_signer=False, is_writable=False
        ),
        AccountMeta(pubkey=accounts["program"], is_signer=False, is_writable=False),
    ]
    if remaining_accounts is not None:
        keys += remaining_accounts
    identifier = b"f\x06=\x12\x01\xda\xeb\xea"
    encoded_args = layout.build(
        {
            "amount": args["amount"],
            "max_sol_cost": args["max_sol_cost"],
        }
    )
    data = identifier + encoded_args
    return Instruction(program_id, data, keys)
