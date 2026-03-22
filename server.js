const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

const CONVERT_API = process.env.CONVERT_API;
const CLOUD_API = process.env.CLOUD_API;

// ================= SPEED LOGGER =================
function log(tool, api){
    console.log(`⚡ ${tool} via ${api}`);
}

// ================= ConvertAPI =================
async function convertAPI(filePath, from, to){
    const form = new FormData();
    form.append("File", fs.createReadStream(filePath));
    form.append("Secret", CONVERT_API);

    const res = await axios.post(
        `https://v2.convertapi.com/convert/${from}/to/${to}`,
        form,
        { headers: form.getHeaders(), timeout: 60000 }
    );

    return res.data;
}

// ================= CloudConvert =================
async function cloudConvert(filePath, input, output){

    const job = await axios.post(
        "https://api.cloudconvert.com/v2/jobs",
        {
            tasks:{
                upload:{ operation:"import/upload" },
                convert:{
                    operation:"convert",
                    input:"upload",
                    input_format:input,
                    output_format:output
                },
                export:{
                    operation:"export/url",
                    input:"convert"
                }
            }
        },
        { headers:{ Authorization:`Bearer ${CLOUD_API}` } }
    );

    const uploadTask = job.data.data.tasks.find(t=>t.name==="upload");

    const form = new FormData();
    Object.entries(uploadTask.result.form).forEach(([k,v])=>{
        form.append(k,v);
    });
    form.append("file", fs.createReadStream(filePath));

    await axios.post(uploadTask.result.form.url, form, {
        headers: form.getHeaders()
    });

    let result;

    while(true){
        const check = await axios.get(
            `https://api.cloudconvert.com/v2/jobs/${job.data.data.id}`,
            { headers:{ Authorization:`Bearer ${CLOUD_API}` } }
        );

        if(check.data.data.status === "finished"){
            result = check.data.data.tasks.find(t=>t.name==="export");
            break;
        }

        await new Promise(r=>setTimeout(r,1500)); // أسرع polling
    }

    return result.result.files;
}

// ================= SMART ENGINE =================
async function smart(filePath, tool){

    try{

        // 🔥 أسرع تحويلات (ConvertAPI)
        if(tool === "pdf-to-word"){
            log(tool,"ConvertAPI");
            return await convertAPI(filePath,"pdf","docx");
        }

        if(tool === "pdf-to-excel"){
            log(tool,"ConvertAPI");
            return await convertAPI(filePath,"pdf","xlsx");
        }

        if(tool === "pdf-to-jpg"){
            log(tool,"ConvertAPI");
            return await convertAPI(filePath,"pdf","jpg");
        }

        if(tool === "jpg-to-pdf"){
            log(tool,"ConvertAPI");
            return await convertAPI(filePath,"jpg","pdf");
        }

        // 💀 تقيل → CloudConvert
        if(tool === "pdf-to-ppt"){
            log(tool,"CloudConvert");
            return await cloudConvert(filePath,"pdf","pptx");
        }

        // fallback
        log(tool,"Fallback ConvertAPI");
        return await convertAPI(filePath,"pdf","txt");

    }catch(e){

        console.log("💥 Fallback triggered");

        // fallback حقيقي
        if(tool === "pdf-to-word"){
            return await cloudConvert(filePath,"pdf","docx");
        }

        throw e;
    }
}

// ================= API =================
app.post("/api/:tool", upload.single("file"), async (req,res)=>{

    let filePath;

    try{
        if(!req.file) return res.json({error:"❌ No file"});

        filePath = req.file.path;

        const result = await smart(filePath, req.params.tool);

        fs.unlinkSync(filePath);

        res.json(result);

    }catch(e){

        if(filePath && fs.existsSync(filePath)){
            fs.unlinkSync(filePath);
        }

        res.json({error:true,message:e.message});
    }
});

// ================= HEALTH =================
app.get("/health",(req,res)=>{
    res.json({
        status:"🔥 ULTRA SERVER",
        speed:"MAX",
        apis:"ConvertAPI + CloudConvert"
    });
});

app.listen(3000,()=>console.log("💀 ULTRA SERVER RUNNING"));
app.listen(PORT, '0.0.0.0', () => {
  console.log("🚀 Server Running");
});
