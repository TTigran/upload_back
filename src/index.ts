import express, {Response, Request} from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import readline from "readline";
import sleep from "sleep"
import unzip from "unzip-stream"
import axios from "axios"


const app = express();
const port = 4000;
const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions));


const storage = multer.diskStorage({
    destination:  (req :Request, file: File, cb: any) => {
        cb(null, 'public')
    },
    filename:  (req :Request, file, cb)=> {
        cb(null, file.originalname)
        fs.createReadStream('./public/name.zip')
            .pipe(unzip.Parse())
            .on('entry', function (entry) {
                entry.pipe(fs.createWriteStream('./public/name.txt'));
                let rl = readline.createInterface({
                    input: fs.createReadStream('./public/name.txt')
                });

                let line_no = 0;

                rl.on('line',  (line) =>{
                    line_no++;
                    names.add(line);
                });
            });
    }
});

const upload = multer({storage}).single('file')
const names  = new Set();

const getNumberOfName = async (name) => {
    const response = await axios.get(`http://openlibrary.org/search.json?author=${name}`)
    return response.data["numFound"];
}

const getMapName = async (array) => {
    let result = [];
    for (let i = 0; i < array.length; i++) {
        result.push({
            name:  array[i],
            number: await getNumberOfName( array[i])
        })
    }
    return result;
}

app.get('/upload/names',async (req:Request, res:Response) => {
    const arr = []
    for (const item of names) {
        arr.push(item);
    }
    res.send(await getMapName(arr));
});

app.post('/upload', (req: Request, res: Response) => {
    upload(req, res,  (err) =>{
        sleep.msleep(500)
        axios.get('http://localhost:4000/upload/names')
            .then(function (response) {
                console.log(response.data)
                res.send(response.data);
            })
    });
});

app.listen(port, err => {
    if (err) return console.error(err);
    return console.log(`server is listening on ${port}`);
});
