require('dotenv').config();
const nodemailer = require('nodemailer');

// 1. 创建一个SMTP传输器（配置发送方信息）
let transporter = nodemailer.createTransport({
    host: 'smtp.163.com',      // 网易163邮箱的SMTP服务器地址 [citation:4][citation:8]
    port: 465,                  // 使用SSL的端口，如果secure为true，则使用465 [citation:4]
    secure: true,               // 对连接使用TLS
    auth: {
        user: process.env.MAIL_USER, // 你的网易邮箱账号 [citation:4]
        pass: process.env.MAIL_PASS          // 这里填的是第一步获取的授权码，不是邮箱登录密码！[citation:4][citation:10]
    }
});

// 2. 定义邮件内容
let mailOptions = {
    from: '"你的名字" <13551320923@163.com>', // 发件人地址，可以自定义昵称 [citation:6]
    to: 'miaoyu2009@qq.com',           // 收件人地址（可以多个，用逗号分隔）[citation:2]
    subject: 'Node.js 测试邮件',            // 邮件主题
    text: 'Hello world?',                  // 纯文本正文 [citation:6]
    // html: '<b>Hello world?</b>'         // 或者使用HTML格式的正文（和text二选一）[citation:3][citation:8]
};

// 3. 发送邮件
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log('发送失败：', error);
    }
    console.log('邮件已成功发送：%s', info.messageId);
    // 如果不需要复用连接，可以关闭
    // transporter.close();
});
