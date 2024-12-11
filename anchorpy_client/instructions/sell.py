from __future__ import annotations
import typing
from solders.pubkey import Pubkey
from solders.system_program import ID as SYS_PROGRAM_ID
from spl.token.constants import TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
from solders.instruction import Instruction, AccountMeta
import borsh_construct as borsh
from ..program_id import PROGRAM_ID


class SellArgs(typing.TypedDict):
    amount: int
    min_sol_output: int


layout = borsh.CStruct("amount" / borsh.U64, "min_sol_output" / borsh.U64)


class SellAccounts(typing.TypedDict):
    global_: Pubkey
    fee_recipient: Pubkey
    mint: Pubkey
    bonding_curve: Pubkey
    associated_bonding_curve: Pubkey
    associated_user: Pubkey
    user: Pubkey
    event_authority: Pubkey
    program: Pubkey


def sell(
    args: SellArgs,
    accounts: SellAccounts,
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
        AccountMeta(
            pubkey=ASSOCIATED_TOKEN_PROGRAM_ID, is_signer=False, is_writable=False
        ),
        AccountMeta(pubkey=TOKEN_PROGRAM_ID, is_signer=False, is_writable=False),
        AccountMeta(
            pubkey=accounts["event_authority"], is_signer=False, is_writable=False
        ),
        AccountMeta(pubkey=accounts["program"], is_signer=False, is_writable=False),
    ]
    if remaining_accounts is not None:
        keys += remaining_accounts
    identifier = b"3\xe6\x85\xa4\x01\x7f\x83\xad"
    encoded_args = layout.build(
        {
            "amount": args["amount"],
            "min_sol_output": args["min_sol_output"],
        }
    )
    data = identifier + encoded_args
    return Instruction(program_id, data, keys)
