from __future__ import annotations
import typing
from solders.pubkey import Pubkey
from solders.system_program import ID as SYS_PROGRAM_ID
from solders.instruction import Instruction, AccountMeta
from anchorpy.borsh_extension import BorshPubkey
import borsh_construct as borsh
from ..program_id import PROGRAM_ID


class SetParamsArgs(typing.TypedDict):
    fee_recipient: Pubkey
    initial_virtual_token_reserves: int
    initial_virtual_sol_reserves: int
    initial_real_token_reserves: int
    token_total_supply: int
    fee_basis_points: int


layout = borsh.CStruct(
    "fee_recipient" / BorshPubkey,
    "initial_virtual_token_reserves" / borsh.U64,
    "initial_virtual_sol_reserves" / borsh.U64,
    "initial_real_token_reserves" / borsh.U64,
    "token_total_supply" / borsh.U64,
    "fee_basis_points" / borsh.U64,
)


class SetParamsAccounts(typing.TypedDict):
    global_: Pubkey
    user: Pubkey
    event_authority: Pubkey
    program: Pubkey


def set_params(
    args: SetParamsArgs,
    accounts: SetParamsAccounts,
    program_id: Pubkey = PROGRAM_ID,
    remaining_accounts: typing.Optional[typing.List[AccountMeta]] = None,
) -> Instruction:
    keys: list[AccountMeta] = [
        AccountMeta(pubkey=accounts["global_"], is_signer=False, is_writable=True),
        AccountMeta(pubkey=accounts["user"], is_signer=True, is_writable=True),
        AccountMeta(pubkey=SYS_PROGRAM_ID, is_signer=False, is_writable=False),
        AccountMeta(
            pubkey=accounts["event_authority"], is_signer=False, is_writable=False
        ),
        AccountMeta(pubkey=accounts["program"], is_signer=False, is_writable=False),
    ]
    if remaining_accounts is not None:
        keys += remaining_accounts
    identifier = b"\x1b\xea\xb24\x93\x02\xbb\x8d"
    encoded_args = layout.build(
        {
            "fee_recipient": args["fee_recipient"],
            "initial_virtual_token_reserves": args["initial_virtual_token_reserves"],
            "initial_virtual_sol_reserves": args["initial_virtual_sol_reserves"],
            "initial_real_token_reserves": args["initial_real_token_reserves"],
            "token_total_supply": args["token_total_supply"],
            "fee_basis_points": args["fee_basis_points"],
        }
    )
    data = identifier + encoded_args
    return Instruction(program_id, data, keys)
