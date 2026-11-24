const multer = require('multer');
const path = require('path');
const fs = require('fs');

const pastaUploads = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(pastaUploads, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, pastaUploads),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    }
});

function fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const extOk = ['.jpeg', '.jpg', '.png'].includes(ext);
    const mimeOk = ['image/jpeg', 'image/png'].includes(file.mimetype);

    if (extOk && mimeOk) return cb(null, true);

    const erro = new Error('A imagem deve ser .jpeg ou .png');
    erro.status = 422;
    cb(erro);
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2 MB
});

// Envolve o multer para devolver erros em JSON
function uploadImagem(req, res, next) {
    upload.single('imagem')(req, res, (err) => {
        if (!err) return next();
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(422).json({ message: 'A imagem deve ter no máximo 2 MB' });
        }
        return res.status(err.status || 400).json({ message: err.message });
    });
}

module.exports = uploadImagem;