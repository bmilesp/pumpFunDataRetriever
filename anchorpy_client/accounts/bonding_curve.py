import typing
from dataclasses import dataclass
from solders.pubkey import Pubkey
from solana.rpc.async_api import AsyncClient
from solana.rpc.commitment import Commitment
import borsh_construct as borsh
from anchorpy.coder.accounts import ACCOUNT_DISCRIMINATOR_SIZE
from anchorpy.error import AccountInvalidDiscriminator
from anchorpy.utils.rpc import get_multiple_accounts
from ..program_id import PROGRAM_ID


class BondingCurveJSON(typing.TypedDict):
    virtual_token_reserves: int
    virtual_sol_reserves: int
    real_token_reserves: int
    real_sol_reserves: int
    token_total_supply: int
    complete: bool


@dataclass
class BondingCurve:
    discriminator: typing.ClassVar = b"\x17\xb7\xf87`\xd8\xac`"
    layout: typing.ClassVar = borsh.CStruct(
        "virtual_token_reserves" / borsh.U64,
        "virtual_sol_reserves" / borsh.U64,
        "real_token_reserves" / borsh.U64,
        "real_sol_reserves" / borsh.U64,
        "token_total_supply" / borsh.U64,
        "complete" / borsh.Bool,
    )
    virtual_token_reserves: int
    virtual_sol_reserves: int
    real_token_reserves: int
    real_sol_reserves: int
    token_total_supply: int
    complete: bool

    @classmethod
    async def fetch(
        cls,
        conn: AsyncClient,
        address: Pubkey,
        commitment: typing.Optional[Commitment] = None,
        program_id: Pubkey = PROGRAM_ID,
    ) -> typing.Optional["BondingCurve"]:
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
    ) -> typing.List[typing.Optional["BondingCurve"]]:
        infos = await get_multiple_accounts(conn, addresses, commitment=commitment)
        res: typing.List[typing.Optional["BondingCurve"]] = []
        for info in infos:
            if info is None:
                res.append(None)
                continue
            if info.account.owner != program_id:
                raise ValueError("Account does not belong to this program")
            res.append(cls.decode(info.account.data))
        return res

    @classmethod
    def decode(cls, data: bytes) -> "BondingCurve":
        if data[:ACCOUNT_DISCRIMINATOR_SIZE] != cls.discriminator:
            raise AccountInvalidDiscriminator(
                "The discriminator for this account is invalid"
            )
        dec = BondingCurve.layout.parse(data[ACCOUNT_DISCRIMINATOR_SIZE:])
        return cls(
            virtual_token_reserves=dec.virtual_token_reserves,
            virtual_sol_reserves=dec.virtual_sol_reserves,
            real_token_reserves=dec.real_token_reserves,
            real_sol_reserves=dec.real_sol_reserves,
            token_total_supply=dec.token_total_supply,
            complete=dec.complete,
        )

    def to_json(self) -> BondingCurveJSON:
        return {
            "virtual_token_reserves": self.virtual_token_reserves,
            "virtual_sol_reserves": self.virtual_sol_reserves,
            "real_token_reserves": self.real_token_reserves,
            "real_sol_reserves": self.real_sol_reserves,
            "token_total_supply": self.token_total_supply,
            "complete": self.complete,
        }

    @classmethod
    def from_json(cls, obj: BondingCurveJSON) -> "BondingCurve":
        return cls(
            virtual_token_reserves=obj["virtual_token_reserves"],
            virtual_sol_reserves=obj["virtual_sol_reserves"],
            real_token_reserves=obj["real_token_reserves"],
            real_sol_reserves=obj["real_sol_reserves"],
            token_total_supply=obj["token_total_supply"],
            complete=obj["complete"],
        )
