interface RateLimitRecord {

  count: number;

  resetTime: number;

}



const requests = new Map<
  string,
  RateLimitRecord
>();





interface RateLimitOptions {

  limit: number;

  windowMs: number;

}





export function rateLimit(

  identifier: string,

  options: RateLimitOptions

) {


  const now = Date.now();



  const record =

    requests.get(identifier);





  if (

    !record

    ||

    now > record.resetTime

  ) {


    requests.set(

      identifier,

      {

        count: 1,

        resetTime:
          now + options.windowMs,

      }

    );



    return {

      success: true,

      remaining:
        options.limit - 1,

    };


  }





  if (

    record.count >= options.limit

  ) {


    return {

      success: false,

      remaining: 0,

    };


  }





  record.count += 1;


  requests.set(

    identifier,

    record

  );





  return {


    success: true,


    remaining:

      options.limit -

      record.count,


  };


}