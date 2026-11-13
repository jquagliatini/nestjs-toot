import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  type Type,
} from "@nestjs/common";
import { t, type I18nKey } from "@nestjs/i18n";

function exceptionMixin<E extends Type<HttpException>>(message: I18nKey, baseCtor: E): E {
  return class extends baseCtor {
    constructor(..._args: any[]) {
      super(t(message));
    }
  };
}

export function InvalidInputException(message: I18nKey): Type<BadRequestException> {
  return exceptionMixin(message, BadRequestException);
}

export function InternalException(message: I18nKey): Type<InternalServerErrorException> {
  return exceptionMixin(message, InternalServerErrorException);
}
