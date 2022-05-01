require('dotenv').config();

const port = process.env.PORT;
const mongoString = process.env.MONGO_URI;
const tokenString = process.env.TOKEN;

const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose');

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error);
});

database.once('connected', () => {
    console.log('Database Connected');
});

const app = express();

const corsOptions = {
    origin: ['https://caionunespn.github.io/imi-motivante', 'https://caionunespn.github.io/imi-desmotivante', 'https://caionunespn.github.io/imi-admin']
};

app.use(cors(corsOptions));
app.use(express.json());

function checkToken(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) {
        return res.status(400).json({error: 'Invalid token'});
    } else {
        const token = auth.split(' ')[1];
        if (!token) {
            return res.status(400).json({error: 'Invalid token'});
        } else {
            if (token !== tokenString) {
                return res.status(400).json({error: 'Invalid token'});
            }
        }
        next()
    }
}

app.get('/resposta/motivante', checkToken, async function(req, res) {
    try {
        database.db.collection('motivante').find({}).toArray(function(err, data){
            if (err) {
                throw Error(err);
            }
            return res.status(200).json(data);
        })
    } catch (err) {
        return res.status(400).json({error: err.message});
    }
});

app.get('/resposta/desmotivante', checkToken, async function(req, res) {
    try {
        database.db.collection('desmotivante').find({}).toArray(function(err, data){
            if (err) {
                throw Error(err);
            }
            return res.status(200).json(data);
        })
    } catch (err) {
        return res.status(400).json({error: err.message});
    }
});

app.post('/resposta', checkToken, async function(req, res) {
    try {
        const {tipo, ...body} = req.body;
        if (Object.keys(body).length <= 0) {
            return res.status(400).json({error: 'Invalid body'});
        }
    
        await database.db.collection(tipo).insertOne(body);
        return res.status(200).json({ok: true});
    } catch (err) {
        return res.status(400).json({error: err.message});
    }
});

app.delete('/resposta/:collection/:id', checkToken, async function(req, res) {
    try {
        const {collection, id} = req.params;
    
        await database.db.collection(collection).findOneAndDelete({
            _id: new mongoose.Types.ObjectId(id),
        });
        return res.status(200).json({
            id,
            collection,
            deleted: true,
        });
    } catch (err) {
        return res.status(400).json({error: err.message});
    }
});

app.listen(port, () => {
    console.log(`Server Started at ${port}`)
})