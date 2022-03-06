import { Inject, Injectable } from '@nestjs/common';
import supertokens from 'supertokens-node';
import { PrismaService } from '../../db/prisma/prisma.service';
import { AuthModuleConfig, ConfigInjectionToken } from '../config.interface';
import { STEmailVerification, STSession } from './supertokens.types';

@Injectable()
export class SupertokensService {
  constructor(@Inject(ConfigInjectionToken) private config: AuthModuleConfig, private prisma: PrismaService) {
    supertokens.init({
      appInfo: config.appInfo,
      supertokens: { connectionURI: config.connectionURI },
      recipeList: [
        STSession.init({ antiCsrf: 'VIA_CUSTOM_HEADER', cookieSameSite: 'strict' }),
        STEmailVerification.init({
          getEmailForUserId: async (userId) =>
            (await prisma.user.findFirst({ where: { uid: userId }, select: { email: true } })).email,
        }),
      ],
    });
  }
}
