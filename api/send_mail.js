const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // 设置跨域请求头，允许外部调用
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 兼容多种参数传递方式（body 或 query）
  const { subject, content, sender, senderName, sender_name, sendemame } = req.body || req.query || {};

  if (!subject || !content) {
    return res.status(400).json({ error: '缺少 subject 或 content 参数' });
  }

  const displayName = sender || senderName || sender_name || sendemame || 'AI Companion';

  // 配置 QQ 邮箱 SMTP 服务
  const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.QQ_EMAIL,       // 这里读取 Vercel 环境变量
      pass: process.env.QQ_AUTH_CODE    // 这里读取 Vercel 环境变量
    }
  });

  try {
    const info = await transporter.sendMail({
      from: `"${displayName}" <${process.env.QQ_EMAIL}>`, 
      to: process.env.TO_EMAIL || process.env.QQ_EMAIL, // 默认发给自己
      subject: subject,
      text: content
    });

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
