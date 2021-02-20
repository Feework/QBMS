var mammoth = require("mammoth");
var textract = require("textract")

textract.fromFileWithPath("D:\\code\\QBMS\\public\\files\\original_computer_titles_202123_221428.docx",function (error, text){
    if(error){
        console.log("error!");
    } else {
        a = text;
        console.log(text);
    }
})
