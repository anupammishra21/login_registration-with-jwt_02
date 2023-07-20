
const nodemailer= require('nodemailer')

class mailer{

    constructor(){

    }
    async sendMail(from,to, subject,html){
        try{
            let transporter = nodemailer.createTransport({
                service:'gmail',
                auth:{
                    user:process.env.EMAIL,
                    pass:process.env.APP_PASSWORD
                }
            })

            // setup the mail options

            let mail_options={
                from,
                to,
                subject,
                html
            }

            // fire the mail

            return await transporter.sendMail(mail_options)

        }catch(err){
            console.log(err);
           return err

        }

    }
}

module.exports= new mailer()