import { prisma } from "../lib/prisma";

import {
  hashPassword,
} from "../lib/auth/password";



async function main() {


  const username =
    "ChaYanLongGong";


  const password =
    "ChaYanLongGong@35";



  const hashedPassword =
    hashPassword(password);





  const existing =
    await prisma.adminUser.findUnique({

      where:{
        username,
      },

    });




  if(existing){

    console.log(
      "Admin user already exists."
    );

    return;

  }






  const admin =
    await prisma.adminUser.create({

      data:{

        username,

        password:
          hashedPassword,

      },

    });






  console.log(
    "Admin created successfully."
  );


  console.log(
    "Username:",
    admin.username
  );


  console.log(
    "Password:",
    password
  );


}





main()

.catch((error)=>{

  console.error(error);

  process.exit(1);

})

.finally(async()=>{

  await prisma.$disconnect();

});