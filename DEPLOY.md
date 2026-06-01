# Render.com pe Free Deploy - Step by Step

## 1. GitHub par repo banana
```bash
# Git init
git init
git add .
git commit -m "Initial commit"

# GitHub pe naya repo banao (https://github.com/new)
# Phir ye commands run karo:
git remote add origin https://github.com/APKA_NAAM/REPO_NAAM.git
git push -u origin main
```

## 2. MongoDB Atlas (Free Database)
1. https://www.mongodb.com/atlas par jao
2. Sign up → Create cluster (Free M0)
3. Database Access → Add user (username/password save rakho)
4. Network Access → Add IP: `0.0.0.0/0` (sabko allow)
5. Cluster mein → Connect → "Connect your application"
6. Connection string copy karo aur `<password>` ko actual password se replace karo

## 3. Render.com - Web Service
1. https://dashboard.render.com/ par sign up (GitHub se connect karo)
2. "New +" → "Web Service"
3. Apna repo select karo
4. Settings:
   - **Name**: `whatsapp-marketing`
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Environment Variables (add karo):
   - `PORT`: `5000`
   - `MONGODB_URI`: (MongoDB Atlas connection string)
   - `JWT_SECRET`: koi bhi random string (e.g., `mysecretkey123`)
   - `ADMIN_EMAIL`: `admin@digitalsms.biz`
   - `ADMIN_PASSWORD`: koi bhi password
   - `CLEANUP_SCHEDULE`: `0 3 * * *`
6. Deploy button dabao

## 4. Deploy ke baad
- App URL milega: `https://whatsapp-marketing.onrender.com`
- Pehli baar mein seed data apne aap create hoga
- Login karo: admin@digitalsms.biz / jo password env mein diya

## Important Notes
- **Free plan** 15 min inactivity ke baad sleep ho jata hai (thoda slow hoga)
- WhatsApp sessions sleep ke baad reconnect nahi hote - **$7/month paid plan** chahiye 24/7 ke liye
- **images/sharp** ka issue aaye to Render dashboard mein "Environment" tab mein `NODE_VERSION`: `18` set karo
- Baad mein domain bhi add kar sakte ho Render se

## 5. (Optional) Better Stack - Free Monitoring
https://betterstack.com/ se log monitoring free mein add kar sakte ho
