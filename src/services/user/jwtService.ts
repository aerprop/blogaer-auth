import jwt from 'jsonwebtoken';

const jwtService = {
  async generateJwtService(username: string, roleId?: number, id?: string) {
    const accessToken = jwt.sign(
      {
        UserInfo: {
          id,
          username,
          role: roleId === 1 ? 'Admin' : 'Author'
        }
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      {
        UserInfo: {
          id,
          username
        }
      },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: '1d' }
    );

    return [accessToken, newRefreshToken];
  }
};

export default jwtService;
