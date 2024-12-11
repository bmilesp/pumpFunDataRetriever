import typing
from anchorpy.error import ProgramError


class NotAuthorized(ProgramError):
    def __init__(self) -> None:
        super().__init__(
            6000, "The given account is not authorized to execute this instruction."
        )

    code = 6000
    name = "NotAuthorized"
    msg = "The given account is not authorized to execute this instruction."


class AlreadyInitialized(ProgramError):
    def __init__(self) -> None:
        super().__init__(6001, "The program is already initialized.")

    code = 6001
    name = "AlreadyInitialized"
    msg = "The program is already initialized."


class TooMuchSolRequired(ProgramError):
    def __init__(self) -> None:
        super().__init__(
            6002, "slippage: Too much SOL required to buy the given amount of tokens."
        )

    code = 6002
    name = "TooMuchSolRequired"
    msg = "slippage: Too much SOL required to buy the given amount of tokens."


class TooLittleSolReceived(ProgramError):
    def __init__(self) -> None:
        super().__init__(
            6003,
            "slippage: Too little SOL received to sell the given amount of tokens.",
        )

    code = 6003
    name = "TooLittleSolReceived"
    msg = "slippage: Too little SOL received to sell the given amount of tokens."


class MintDoesNotMatchBondingCurve(ProgramError):
    def __init__(self) -> None:
        super().__init__(6004, "The mint does not match the bonding curve.")

    code = 6004
    name = "MintDoesNotMatchBondingCurve"
    msg = "The mint does not match the bonding curve."


class BondingCurveComplete(ProgramError):
    def __init__(self) -> None:
        super().__init__(
            6005, "The bonding curve has completed and liquidity migrated to raydium."
        )

    code = 6005
    name = "BondingCurveComplete"
    msg = "The bonding curve has completed and liquidity migrated to raydium."


class BondingCurveNotComplete(ProgramError):
    def __init__(self) -> None:
        super().__init__(6006, "The bonding curve has not completed.")

    code = 6006
    name = "BondingCurveNotComplete"
    msg = "The bonding curve has not completed."


class NotInitialized(ProgramError):
    def __init__(self) -> None:
        super().__init__(6007, "The program is not initialized.")

    code = 6007
    name = "NotInitialized"
    msg = "The program is not initialized."


CustomError = typing.Union[
    NotAuthorized,
    AlreadyInitialized,
    TooMuchSolRequired,
    TooLittleSolReceived,
    MintDoesNotMatchBondingCurve,
    BondingCurveComplete,
    BondingCurveNotComplete,
    NotInitialized,
]
CUSTOM_ERROR_MAP: dict[int, CustomError] = {
    6000: NotAuthorized(),
    6001: AlreadyInitialized(),
    6002: TooMuchSolRequired(),
    6003: TooLittleSolReceived(),
    6004: MintDoesNotMatchBondingCurve(),
    6005: BondingCurveComplete(),
    6006: BondingCurveNotComplete(),
    6007: NotInitialized(),
}


def from_code(code: int) -> typing.Optional[CustomError]:
    maybe_err = CUSTOM_ERROR_MAP.get(code)
    if maybe_err is None:
        return None
    return maybe_err
