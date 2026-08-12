import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Defina ADMIN_EMAIL e ADMIN_PASSWORD no .env antes de rodar o seed."
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // O admin de bootstrap sempre recebe acesso a todas as páginas — sem isso,
  // rodar o seed do zero criaria um admin sem nenhuma permissão, incapaz de
  // se auto-conceder acesso (nem à própria página de Administradores).
  const paginasPermitidas = [
    "empreendimentos",
    "corretores",
    "configuracoes",
    "administradores",
    "espelho-venda",
  ];

  const admin = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, role: "ADMIN", status: "APROVADO", paginasPermitidas },
    create: {
      email,
      name: "Administrador",
      password: hashedPassword,
      role: "ADMIN",
      status: "APROVADO",
      paginasPermitidas,
    },
  });

  console.log("Admin pronto:", admin.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
