export function validatePasswordStrength(
  password: string
) {

  const errors:string[] = [];


  if(password.length < 10){

    errors.push(
      "Password must be at least 10 characters."
    );

  }


  if(!/[A-Z]/.test(password)){

    errors.push(
      "Password must contain uppercase letter."
    );

  }


  if(!/[a-z]/.test(password)){

    errors.push(
      "Password must contain lowercase letter."
    );

  }


  if(!/[0-9]/.test(password)){

    errors.push(
      "Password must contain number."
    );

  }


  if(!/[^A-Za-z0-9]/.test(password)){

    errors.push(
      "Password must contain special character."
    );

  }


  return {

    valid:
      errors.length === 0,

    errors,

  };

}