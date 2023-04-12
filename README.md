# tinyApp

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

![Screenshot 2023-04-12 at 2 49 46 PM](https://user-images.githubusercontent.com/68622003/231558637-82a39920-7a7c-45ad-81d1-eb2237ca2817.png)
Main page before logging in
- I used an alert-danger class to show the user they need to login before using the site


![Screenshot 2023-04-12 at 2 53 32 PM](https://user-images.githubusercontent.com/68622003/231559075-5fba69ef-fd57-4cf7-bae6-67b1d891ec69.png)
Login Page

![Screenshot 2023-04-12 at 2 53 46 PM](https://user-images.githubusercontent.com/68622003/231559656-06290834-3c41-47e3-b097-eb2ccd0e4c67.png)
Registration Page

![Screenshot 2023-04-12 at 2 54 10 PM](https://user-images.githubusercontent.com/68622003/231559899-522a1a67-adf3-4981-b940-9a7f501a029b.png)
Main page after user has logged in
- if the user has no URL I added an alert-info to inform the user


![Screenshot 2023-04-12 at 2 54 31 PM](https://user-images.githubusercontent.com/68622003/231560418-dcbef401-28cf-4fa1-a108-3490de6ca827.png)
Add a new url page

![Screenshot 2023-04-12 at 2 55 08 PM](https://user-images.githubusercontent.com/68622003/231560560-97108db6-635a-4117-9896-93426fa56083.png)
Once you add a new URL you are redirected to this page to edit (if needed)

![Screenshot 2023-04-12 at 2 54 58 PM](https://user-images.githubusercontent.com/68622003/231560514-c1e67213-e0bb-4596-aa1d-4d0a8b5d7f60.png)
Main page once a user has input a URL 
## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.