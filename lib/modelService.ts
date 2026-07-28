import { prisma } from "./prisma";


type ModelLevel =
  | "CROWN"
  | "SSS"
  | "SS"
  | "S"
  | "A";



const LEVEL_ORDER: ModelLevel[] = [

  "CROWN",

  "SSS",

  "SS",

  "S",

  "A",

];





export async function getAllModels() {


  const models =
    await prisma.model.findMany({

      orderBy: {

        number: "asc",

      },

    });



  return models.sort(

    (a,b)=>{

      return (

        LEVEL_ORDER.indexOf(
          a.level as ModelLevel
        )

        -

        LEVEL_ORDER.indexOf(
          b.level as ModelLevel
        )

      )

      ||

      a.number - b.number;

    }

  );

}







export async function getModelById(
  id:number
) {


  return prisma.model.findUnique({

    where:{
      id,
    },

  });

}







export async function generateModelCode(
  level:ModelLevel
) {


  const latest =
    await prisma.model.findFirst({

      where:{
        level,
      },

      orderBy:{
        number:"desc",
      },

      select:{
        number:true,
      },

    });



  const nextNumber =
    (latest?.number ?? 0) + 1;



  return {

    number:
      nextNumber,


    code:
      `${level}${String(nextNumber).padStart(3,"0")}`,

  };

}







export async function createModel(

data:{

  level:ModelLevel;

  title?:string;

  nationality?:string;

  city?:string;

  age?:number;

  height?:number;

  weight?:number;

  languages?:string;

  services?:string;

  avatar?:string;

  gallery?:string;

  videos?:string;

  introduction?:string;

  online?:boolean;

  featured?:boolean;

}

){


  return prisma.$transaction(

    async(tx)=>{


      const latest =
        await tx.model.findFirst({

          where:{
            level:data.level,
          },

          orderBy:{
            number:"desc",
          },

          select:{
            number:true,
          },

        });



      const number =
        (latest?.number ?? 0)+1;



      const code =
        `${data.level}${String(number).padStart(3,"0")}`;



      return tx.model.create({

        data:{


          level:
            data.level,


          number,


          code,


          title:
            data.title ?? "",


          nationality:
            data.nationality ?? "",


          city:
            data.city ?? "",


          age:
            data.age ?? 18,


          height:
            data.height ?? 160,


          weight:
            data.weight ?? 50,


          languages:
            data.languages ?? "",


          services:
            data.services ?? "",


          avatar:
            data.avatar ?? "",


          gallery:
            data.gallery ?? "",


          videos:
            data.videos ?? "",


          introduction:
            data.introduction ?? "",


          online:
            data.online ?? true,


          featured:
            data.featured ?? false,


        },

      });


    }

  );

}







export async function updateModel(

id:number,

data:{

  level?:ModelLevel;

  title?:string;

  nationality?:string;

  city?:string;

  age?:number;

  height?:number;

  weight?:number;

  languages?:string;

  services?:string;

  avatar?:string;

  gallery?:string;

  videos?:string;

  introduction?:string;

  online?:boolean;

  featured?:boolean;

}

){


  return prisma.model.update({

    where:{
      id,
    },


    data,


  });

}








export async function deleteModel(
id:number
){


  return prisma.model.delete({

    where:{
      id,
    },

  });

}