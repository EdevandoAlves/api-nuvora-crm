import { AppDataSource } from "../data-source";
import { forgotPasswordDTO, resetPasswordBodyDTO, resetPasswordParamsDTO, userCreateDTO, userLoginDTO } from "../dtos/users.dto";
import { Organization } from "../entity/Organization";
import { User, UserRole } from "../entity/User";
import * as bcrypt from "bcrypt";
import { generateSlug } from "../helper/generateSlug";
import * as jwt from "jsonwebtoken";
import * as crypto from "crypto";
import * as nodemailer from "nodemailer";
import { tokenDTO } from "../dtos/organizations.dto";

export class UserService {
  private userRepo = AppDataSource.getRepository(User);
  private orgRepo = AppDataSource.getRepository(Organization);

  async createUser(data: userCreateDTO) {
    return AppDataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const orgRepo = manager.getRepository(Organization);

      const { email, password, firstName, lastName, companyName, cnpj } = data;

      const existingEmail = await userRepo.findOneBy({ email });
      if (existingEmail) {
        throw { status: 409, message: "email is already in use" };
      }

      const slug = generateSlug(companyName);
      const organization = orgRepo.create({ name: companyName, slug, cnpj });
      await orgRepo.save(organization);

      const passwordHashed = await bcrypt.hash(password, 10);

      const user = userRepo.create({ email, password: passwordHashed, firstName, lastName, organizationId: organization.id, role: UserRole.OWNER })
      await userRepo.save(user);

      organization.ownerId = user.id;
      await orgRepo.save(organization);

      return user;
    });
  }

  async userLogin(data: userLoginDTO) {
    const { email, password } = data;

    const user = await this.userRepo.findOneBy({ email });
    if (!user) {
      throw { status: 401, message: "Invalid credentials" };
    }

    if (user.isActive !== true) {
      throw { status: 401, message: "Invalid credentials" };
    }

    const organization = await this.orgRepo.findOneBy({ id: user.organizationId });
    if (organization.isActive !== true) {
      throw { status: 401, message: "Invalid credentials" };
    }

    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword) {
      throw { status: 401, message: "Invalid credentials" };
    }

    interface jwtPayload {
      id: string;
      organization: string;
      role: string
    }

    const payload: jwtPayload = { id: user.id, organization: user.organizationId, role: user.role };

    if (!process.env.SECRET_KEY) {
      throw new Error("SECRET_KEY missing");
    }

    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "1d" });
    return token;
  }

  async forgotPassword(data: forgotPasswordDTO) {
    const { email } = data;

    const user = await this.userRepo.findOneBy({ email });
    if (!user) {
      return
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    user.resetToken = token;
    await this.userRepo.save(user);

    const resetLink = `http://localhost:8000/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: `"CRM" < ${process.env.SMTP_USER}> `,
        to: email,
        subject: "Recuperação de Senha",
        html: `
      <h1> Recuperação de Senha </h1>
      <p> Você solicitou a recuperação de senha.</p>
      <p> Clique no link abaixo para redefinir sua senha: </p>
      <a href = "${resetLink}" > Redefinir Senha </a>
      <p> Este link expira em 1 hora.</p>
      <p> Se você não solicitou isso, ignore este email.</p>
      `,
      });

      return;
    } catch (err) {
      throw { error: 500, message: "Error sending code. Please try again later." }
    }
  }

  async resetPassword(paramsData: resetPasswordParamsDTO, bodyData: resetPasswordBodyDTO) {
    const { token } = paramsData;
    const { password } = bodyData;

    const user = await this.userRepo.findOne({ where: { resetToken: token } });
    if (!user || !user.expiresAt || user.expiresAt < new Date()) {
      throw { status: 400, message: "Token is invalid or has expired." };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      throw { status: 409, message: "The new password cannot be the same as the current password." };
    }

    const newPassword = await bcrypt.hash(password, 10);
    user.password = newPassword;
    user.resetToken = null;
    user.expiresAt = null;
    await this.userRepo.save(user);

    return;
  }

  async meSettings(data: tokenDTO): Promise<Pick<User, "id" | "organizationId" | "email" | "firstName" | "lastName">> {
    const { id } = data;

    const user = await this.userRepo.findOneBy({ id });
    if (!user || user.isActive === false) {
      throw { status: 401, message: "user not found" }
    }

    return {
      id: user.id,
      organizationId: user.organizationId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    } satisfies Pick<User, "id" | "organizationId" | "email" | "firstName" | "lastName">
  }
}
