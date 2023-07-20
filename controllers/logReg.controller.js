const logReg = require("../models/logReg.model");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const mailer = require('../helper/mailer')
const fs = require("fs");
const os = require('os')

class logRegController {

    // auth part ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async userAuth(req, res, next) {
        try {
          if (!_.isEmpty(req.user)) {
            next();
          } else {
            req.flash('error', "unauthorized user   please login ")
            res.redirect("/show-login");
          }
        } catch (err) {
          throw err;
        }
      }






    // async  showRegistrationForm //////////////////////////////////////////////////////////////////////////////////////////////
  async showRegistrationForm(req, res) {
    try {
      res.render("registration", {
        title: "Registration",
        success: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (err) {
      throw err;
    }
  }




//  register  details ////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async register(req, res) {
    try {
      let is_email_exists = await logReg.findOne({ email: req.body.email });
      if (!_.isEmpty(is_email_exists)) {
        req.flash("error", "this email is already exists");
        return res.redirect("/");
      }

      if (req.body.password !== req.body.confirm_password) {
        req.flash("error", "password and confirm password should be same");
        return res.redirect("/");
      }
        //  console.log(req.body);

      req.body.image = req.file.filename;
      // let PassWord = req.body.password;
      // req.body.password = bcrypt.hashSync(req.body.password , bcrypt.genSaltSync(10));
      req.body.password = bcrypt.hashSync(req.body.password , bcrypt.genSaltSync(10));



      let register = await logReg.create(req.body);
      // console.log("register saved data", register);

      if (!_.isEmpty(register) ) {
        let is_mail_send = await mailer.sendMail(process.env.EMAIL,req.body.email,'email submitted',`hiw ${req.body.name} your data 
        submitted with ${req.body.password} password`)
        console.log('mail sending', is_mail_send);
        req.flash("success", "your registration is sucessfully done");
        return res.redirect("/show-login");
      } else {
        req.flash("error", "something went wrong ");
        return res.redirect("/");
      }
    } catch (err) {
      console.log(err);
    }
  }

//   show login Form///////////////////////////////////////////////////////////////////////////////////////////////////////

  async showLoginForm(req, res) {
    try {
      res.render("login", {
        title: "Login",
        success: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (err) {
      throw err;
    }
  }

//   login functionality part /////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  async login(req, res) {
    try {
      // console.log(req.body);
      let is_user_exists = await logReg.findOne({ email: req.body.email });
      if (_.isEmpty(is_user_exists)) {
        req.flash("error", "Email is not exists!");
        return res.redirect("/show-login");
      }

      const hash_password = is_user_exists.password;
      // console.log(hash_password);
   
      if (bcrypt.compareSync(req.body.password, hash_password)) {
        let token = jwt.sign(
          {
            id: is_user_exists._id,
          },
          "MYS3CR3TK3Y",
          { expiresIn: "2d" }
        );

        res.cookie("user_token", token);

        const  dateTimeObject = new Date()
        await mailer.sendMail(process.env.EMAIL, is_user_exists.email, 'Logged In Successfully!!!', `Hi ${is_user_exists.name} You have logged in.<br> Date : ${dateTimeObject.toDateString()} <br> Time : ${dateTimeObject.toTimeString()} <br> Operating System : ${os.type()} <br> Platform Name : ${os.platform()} `);
        res.redirect("/dashboard");
      } else {
        req.flash("error", "error!");
        return res.redirect("/show-login");
      }
    } catch (err) {
      throw err;
    }
  }


  

//    dashboard path//////////////////////////////////////////////////////////////////////////

  async dashboard(req, res) {
    
    try {
      // console.log(req.user.id);
      let all_data = await logReg.findOne({_id:req.user.id})
      console.log("data", all_data);
      
      res.render("dashboard", {
        title: "Dashboard",
        all_data
      });
    } catch (err) {
      throw err;
    }
  }

//   async show change password ////////////////////////////////////////////////////////////////////////////////////


async showChangePassword(req, res) {
  // let update_password = await logReg.findOne({ _id: req.params.id });
    
    try {
      
      res.render("showPassForm", {
        title: "show password form",
        error:req.flash("error")

        // update_password
      });
    } catch (err) {
      throw err;
    }
  }


//   update password logical  method///////////////////////////////////////////////////////////////////////////////////////////






async updatePassword(req, res){
  try{
      const loginUser = await logReg.findOne({ _id : req.user.id }); 
      console.log("login user",loginUser);
              
      if(bcrypt.compareSync(req.body.oldPassword, loginUser.password)){
          if(req.body.newPassword != req.body.confirmPassword){
              req.flash('error','Password not Matching');
              return res.redirect('/changePassword');
              // console.log(req.body.newPassword);
              // console.log(req.body.oldPassword);
          }
          if(req.body.newPassword == req.body.oldPassword){
              req.flash('error','New Password cannot be same as Old Password');
              return res.redirect('/changePassword');
          }
          let newPassword = req.body.newPassword;
          console.log("new password", newPassword);
          req.body.newPassword = bcrypt.hashSync(req.body.newPassword , bcrypt.genSaltSync(10));                
              let updated_obj = {       
                  password: req.body.newPassword,
              }
              //console.log(loginUser.password ,"OLD");
              //console.log(req.body.newPassword, "NEW");
              let update_data = await logReg.findByIdAndUpdate(req.user.id, updated_obj);
              if (!_.isEmpty(update_data)) {
                  // const dateTimeObject = new Date();
                  // await mailer.sendMail(process.env.EMAIL, loginUser.email, 'Password Changed Successfully!!!', `Hi ${loginUser.name} Your password changed successfully.<br> New Password : ${newPassword} <br> Date : ${dateTimeObject.toDateString()} <br> Time : ${dateTimeObject.toTimeString()} <br> Operating System : ${os.type()} <br> Platform Name : ${os.platform()} `);
                  req.flash('success','Password succesfully updated');
                  res.redirect('/dashboard')                
              } else {
                  req.flash('error','There was some error. Please try again');
                  res.redirect('/changePassword')  
              }
      }
       else {
          req.flash('error','Old Password is wrong');
          res.redirect('/changePassword');
      }
  } catch(err){
      throw err;
  }
}





// logout method ////////////////////////////////////////////////////////////////////////////////////////////////////


async logout(req, res) {
    try {
        res.clearCookie('user_token');
        res.redirect('/show-login')
    } catch (err) {
        throw err;
    }
}





  


}

module.exports = new logRegController();