import typing
from dataclasses import dataclass
from solders.pubkey import Pubkey
from solana.rpc.async_api import AsyncClient
from solana.rpc.commitment import Commitment
import borsh_construct as borsh
from anchorpy.coder.accounts import ACCOUNT_DISCRIMINATOR_SIZE
from anchorpy.error import AccountInvalidDiscriminator
from anchorpy.utils.rpc import get_multiple_accounts
from anchorpy.borsh_extension import BorshPubkey
from ..program_id import PROGRAM_ID


class GlobalJSON(typing.TypedDict):
    initialized: bool
    authority: str
    fee_recipient: str
    initial_virtual_token_reserves: int
    initial_virtual_sol_reserves: int
    initial_real_token_reserves: int
    token_total_supply: int
    fee_basis_points: int


@dataclass
class Global:
    discriminator: typing.ClassVar = b"\xa7\xe8\xe8\xb1\xc8lr\x7f"
    layout: typing.ClassVar = borsh.CStruct(
        "initialized" / borsh.Bool,
        "authority" / BorshPubkey,
        "fee_recipient" / BorshPubkey,
        "initial_virtual_token_reserves" / borsh.U64,
        "initial_virtual_sol_reserves" / borsh.U64,
        "initial_real_token_reserves" / borsh.U64,
        "token_total_supply" / borsh.U64,
        "fee_basis_points" / borsh.U64,
    )
    initialized: bool
    authority: Pubkey
    fee_recipient: Pubkey
    initial_virtual_token_reserves: int
    initial_virtual_sol_reserves: int
    initial_real_token_reserves: int
    token_total_supply: int
    fee_basis_points: int

    @classmethod
    async def fetch(
        cls,
        conn: AsyncClient,
        address: Pubkey,
        commitment: typing.Optional[Commitment] = None,
        program_id: Pubkey = PROGRAM_ID,
    ) -> typing.Optional["Global"]:
        resp = await conn.get_account_info(address, commitment=commitment)
        info = resp.value
        if info is None:
            return None
        if info.owner != program_id:
            raise ValueError("Account does not belong to this program")
        bytes_data = info.data
        return cls.decode(bytes_data)

    @classmethod
    async def fetch_multiple(
        cls,
        conn: AsyncClient,
        addresses: list[Pubkey],
        commitment: typing.Optional[Commitment] = None,
        program_id: Pubkey = PROGRAM_ID,
    ) -> typing.List[typing.Optional["Global"]]:
        infos = await get_multiple_accounts(conn, addresses, commitment=commitment)
        res: typing.List[typing.Optional["Global"]] = []
        for info in infos:
            if info is None:
                res.append(None)
                continue
            if info.account.owner != program_id:
                raise ValueError("Account does not belong to this program")
            res.append(cls.decode(info.account.data))
        return res

    @classmethod
    def decode(cls, data: bytes) -> "Global":
        if data[:ACCOUNT_DISCRIMINATOR_SIZE] != cls.discriminator:
            raise AccountInvalidDiscriminator(
                "The discriminator for this account is invalid"
            )
        dec = Global.layout.parse(data[ACCOUNT_DISCRIMINATOR_SIZE:])
        return cls(
            initialized=dec.initialized,
            authority=dec.authority,
            fee_recipient=dec.fee_recipient,
            initial_virtual_token_reserves=dec.initial_virtual_token_reserves,
            initial_virtual_sol_reserves=dec.initial_virtual_sol_reserves,
            initial_real_token_reserves=dec.initial_real_token_reserves,
            token_total_supply=dec.token_total_supply,
            fee_basis_points=dec.fee_basis_points,
        )

    def to_json(self) -> GlobalJSON:
        return {
            "initialized": self.initialized,
            "authority": str(self.authority),
            "fee_recipient": str(self.fee_recipient),
            "initial_virtual_token_reserves": self.initial_virtual_token_reserves,
            "initial_virtual_sol_reserves": self.initial_virtual_sol_reserves,
            "initial_real_token_reserves": self.initial_real_token_reserves,
            "token_total_supply": self.token_total_supply,
            "fee_basis_points": self.fee_basis_points,
        }

    @classmethod
    def from_json(cls, obj: GlobalJSON) -> "Global":
        return cls(
            initialized=obj["initialized"],
            authority=Pubkey.from_string(obj["authority"]),
            fee_recipient=Pubkey.from_string(obj["fee_recipient"]),
            initial_virtual_token_reserves=obj["initial_virtual_token_reserves"],
            initial_virtual_sol_reserves=obj["initial_virtual_sol_reserves"],
            initial_real_token_reserves=obj["initial_real_token_reserves"],
            token_total_supply=obj["token_total_supply"],
            fee_basis_points=obj["fee_basis_points"],
        )
