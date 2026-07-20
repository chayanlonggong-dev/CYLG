export function contactNotificationTemplate(
  name: string,
  email: string,
  message: string
) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>New Contact Request</title>
</head>

<body
style="
font-family: Arial, sans-serif;
background:#050505;
color:#ffffff;
padding:40px;
"
>

<h2 style="color:#D4AF37;">
New Contact Request
</h2>

<p>
<strong>Name:</strong>
${name}
</p>

<p>
<strong>Email:</strong>
${email}
</p>

<p>
<strong>Message:</strong>
</p>

<p>
${message}
</p>

</body>
</html>
`;
}


export function bookingNotificationTemplate(
  modelCode: string,
  clientName: string,
  contact: string
) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Booking Request</title>
</head>

<body
style="
font-family: Arial, sans-serif;
background:#050505;
color:#ffffff;
padding:40px;
"
>

<h2 style="color:#D4AF37;">
New Booking Request
</h2>

<p>
<strong>Model:</strong>
${modelCode}
</p>

<p>
<strong>Client:</strong>
${clientName}
</p>

<p>
<strong>Contact:</strong>
${contact}
</p>

</body>
</html>
`;
}


export function adminAlertTemplate(
  title: string,
  content: string
) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${title}</title>
</head>

<body
style="
font-family:Arial,sans-serif;
background:#050505;
color:#ffffff;
padding:40px;
"
>

<h2 style="color:#D4AF37;">
${title}
</h2>

<p>
${content}
</p>

</body>
</html>
`;
}