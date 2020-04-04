var express = require('express')
var serveStatic = require('serve-static')
var contentDisposition = require('content-disposition')
var morgan = require('morgan')
 
const fs = require('fs');
 
var app = express()

function setHeaders (res, path) {
    res.setHeader('Content-Disposition', contentDisposition(path))
	
}

app.use((req,res,next) => {
	console.log("request")
	
	try {
		let auth = req.headers['authorization']
		console.log(`auth: ${auth}`)
		let cred = Buffer.from(/Basic (.*)/.exec(auth)[1], 'base64').toString('ascii');
		if (cred != `${process.env.USERNAME}:${process.env.PASSWORD}`) {
			throw 'Invalid credentials'
		}
	} catch {
		return res.status(401).header('WWW-Authenticate','Basic').send()
	}
	next()
})

app.use(morgan('combined'))

app.get('/',(req,res) => {
    res.write(`<html><head><title>${process.env.TITLE || "Shared folder"}</title></head>`)
    res.write(`<body>`)
    res.write(`<h1>${process.env.TITLE || "Shared folder"}</h1>`)
    res.write(`<ol>`)
    
    for (let file of fs.readdirSync(process.env.SHARED_FOLDER)) {
        res.write(`<li><a href="/${file}">${file}</a></li>`)
    }

    res.write(`</ol>`)
    res.write(`</body>`)
    res.write(`</html>`)
    res.end()
})

app.use(serveStatic(process.env.SHARED_FOLDER, { 'index': false, 'setHeaders': setHeaders }))
app.listen(parseInt(process.env.PORT || "3000"),'0.0.0.0')

// http://cs.petercurtis.id.au:3000/