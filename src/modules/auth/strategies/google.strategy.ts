import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthService } from '../google.service';
import { GoogleProfile } from '../../../interfaces/googleProps';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly googleAuthService: GoogleAuthService,
    config: ConfigService,
  ) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: config.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['openid', 'email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { id, emails, name, _json } = profile;

    const googleProfile: GoogleProfile = {
      id,
      email: emails![0].value,
      firstName: name!.givenName!,
      lastName: name!.familyName!,
    };

    try {
      const user = await this.googleAuthService.findOrCreate(googleProfile);
      done(null, user);
    } catch (err) {
      done(err as Error, false);
    }
  }
}
