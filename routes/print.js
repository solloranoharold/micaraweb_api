const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const router = express.Router();
const fs = require("fs-extra");
const moment = require('moment')
const { Writable } = require('stream');

router.use(cors());
router.use(bodyParser.json());

router.post("/print",async(req, res) => {
    let titleHeaders = getDays( req.body.date_range.date1 , req.body.date_range.date2) < 365 ? `${moment(req.body.date_range.date1).format('MMM-DD-YYYY')} - ${moment(req.body.date_range.date2).format('MMM-DD-YYYY')}` : `${moment(req.body.date_range.date2).format('MMM-YYYY')}` 
    
    let array = req.body.reports

    let storeArrayValue = []
    let tableData = [
         [
            { text: 'Home Owner', alignment: 'center', style:{ fontSize: 10},bold:true },
            { text: 'Visitor Name', alignment: 'center' , style:{ fontSize: 10},bold:true},
            { text: 'Vehicle', alignment: 'center' , style:{ fontSize: 10},bold:true},
            { text: 'Plate', alignment: 'center' , style:{ fontSize: 10},bold:true},
            { text: 'Purpose ', alignment: 'center', style:{ fontSize: 10},bold:true },
            { text: 'Arrival', alignment: 'center', style:{ fontSize: 10},bold:true },
            { text: 'Departure', alignment: 'center', style:{ fontSize: 10},bold:true },
            { text: 'Checked By', alignment: 'center', style:{ fontSize: 10},bold:true },
            { text: 'Date Created', alignment: 'center', style:{ fontSize: 10},bold:true }
        ]
    ]
    for (let x = 0; x < array.length; x++){
        let data = array[x]
        const { HomeOwner , visitor_name  , vehicle , plate_no , purpose , date_arrival,date_departure,checker , DateCreated  } = data 
        storeArrayValue.push( 
            { text: HomeOwner, alignment: 'center', style: { fontSize: 9 } },
            { text: visitor_name, alignment: 'center', style: { fontSize: 9 } },
            { text: vehicle, alignment: 'center', style: { fontSize: 9 } },
            { text: plate_no, alignment: 'center', style: { fontSize: 9 } },
            { text: purpose, alignment: 'center', style: { fontSize: 9 } },
            { text: date_arrival, alignment: 'center', style: { fontSize: 9 } },
            { text: date_departure, alignment: 'center', style: { fontSize: 9 } },
            { text: checker, alignment: 'center', style: { fontSize: 9 } },
            { text: DateCreated, alignment: 'center', style: { fontSize: 9 } },
        )
        tableData.push( storeArrayValue)
        storeArrayValue= []
    }
var fonts = {
    Roboto: {
        normal: './Roboto/Roboto-Regular.ttf',  // Path to your font files
        bold: './Roboto/Roboto-Bold.ttf',
        italics: './Roboto/Roboto-Italic.ttf',
        bolditalics: './Roboto/Roboto-BoldItalic.ttf'
    }
}

var PdfPrinter = require('pdfmake');
var printer = new PdfPrinter(fonts);
var fs = require('fs');

let content=[
        {
            text: 'Date: ' + moment().format('YYYY-MM-DD'),
            alignment: 'right',  // Align the date to the right
            fontSize: 12,
            // margin: [0, 5, 0, 0] // margin on top to separate from previous content
        },
        {
            text: 'MICARA ESTATES - TANZA ',
            alignment: 'center',  // Align the date to the center
            fontSize: 18,
            bold: true,
            decoration: 'underline',
            margin: [0, 25, 0, 0] // margin on top to separate from previous content
    },
         {
            text: `${titleHeaders} ${moment(req.body.date_range.date2).format('YYYY')} VISITOR LIST`,
            alignment: 'center',  // Align the date to the center
            fontSize: 20,
            bold: true,
            decoration: 'underline',
            margin: [0, 25, 0, 0] // margin on top to separate from previous content
        },
    // DATA 
        {
            style: 'tableExample',
            table: {
                body: tableData
            }
        },   
        {
			alignment: 'justify',
			columns: [
				{text: 'Prepared By:_________________________' ,style:{fontSize: 10} },
				{text: 'Noted By:_________________________',style:{fontSize: 10}}
            ],
             margin: [0, 25, 0, 0] // margin on top to separate from previous content
    },
          {
			alignment: 'justify',
			columns: [
				{text: 'Reviewed By:_________________________' ,style:{fontSize: 10} },
				{text: 'Approved By:_________________________',style:{fontSize: 10}}
            ],
             margin: [0, 25, 0, 0] // margin on top to separate from previous content
		},
    ] 

// json with invoice layout 
var docDefinition = {
    pageOrientation: 'landscape',
    content: content,
    footer: (currentPage, pageCount, pageSize) => {
        return [
            {
                text: `Page ${currentPage} of ${pageCount}`,
                alignment: 'center', // Align the footer text to the center
                fontSize: 10,
                margin: [0, 10]
            }
        ];
    },
    styles: { 
       	tableExample: {
			margin: [0, 10, 0, 0]
		}, 
    }

};
var options = {};

// create invoice and save it to invoices_pdf folder 
var pdfDoc = printer.createPdfKitDocument(docDefinition, options);

    // pdfDoc.pipe(fs.createWriteStream('output.pdf'));
    // pdfDoc.end();
    let buffers = [];

    // Pipe the PDF to a writable stream that collects the chunks
    pdfDoc.pipe(new Writable({
    write(chunk, encoding, callback) {
        buffers.push(chunk);  // Push each chunk of the PDF to the buffers array
        callback();
    }
    }));
    pdfDoc.end();
    pdfDoc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers); // Combine all chunks into a single buffer
        console.log('PDF generated as buffer!');
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=generated-pdf.pdf',
            'Content-Length': pdfBuffer.length
        });
        
        res.send(pdfBuffer);
        // Save the buffer to a file (optional)
        // fs.writeFileSync('generated_pdf.pdf', pdfBuffer);
        // console.log('PDF saved as "generated_pdf.pdf"');
    });
});



function getDays( date1 , date2){
      const startDate = new Date(date1);
    const endDate = new Date(date2);

    // Calculate the difference in milliseconds
    const timeDifference = endDate - startDate;
    // Convert the difference from milliseconds to days
    let days = timeDifference / (1000 * 3600 * 24);
    
    console.log(days,'timeDifference' )
    return days 
}

module.exports = router;
