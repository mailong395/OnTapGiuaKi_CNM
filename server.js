const express = require("express");
const app = express();

app.use(express.json({ exteneded: false }));
app.use(express.static("./views"));
app.set("view engine", "ejs");
app.set("views", "./views");

const AWS = require("aws-sdk");
const config = new AWS.Config({
  accessKeyId: "AKIAZL5VN7I7HKLOCZSV",
  secretAccessKey: "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",
  region: "ap-southeast-1",
});
AWS.config = config;

const docClient = new AWS.DynamoDB.DocumentClient();

const tableName = "BaiBao";

const multer = require("multer");
const upload = multer();

app.get("/", function (req, res) {
  const params = {
    TableName: tableName,
  };

  docClient.scan(params, function (err, data) {
    if (err) {
      res.send("Error");
    } else {
      return res.render("index", { baiBaos: data.Items });
    }
  });
});

app.get("/Add", function (req, res) {
  const params = {
    TableName: tableName,
  };

  docClient.scan(params, function (err, data) {
    if (err) {
      res.send("Error");
    } else {
      return res.render("formAdd", { baiBaos: data.Items });
    }
  });
});

app.post("/", upload.fields([]), function (req, res) {
  const { idBaiBao, isbn, nxb, soTrang, tenBaiBao, tenTacGia } = req.body;

  const params = {
    TableName: tableName,
    Item: {
      idBaiBao: idBaiBao,
      isbn: isbn,
      nxb: parseInt(nxb),
      soTrang: parseInt(soTrang),
      tenBaiBao: tenBaiBao,
      tenTacGia: tenTacGia,
    },
    Err: "",
  };

  if (/^$/.test(tenBaiBao) || /^$/.test(tenTacGia)) {
    return res.send("Không được rổng");
  } else if (!/^\d{3}-\d{3}-\d{3}$/.test(isbn)) {
    return res.send("Không đúng định dạng");
  } else if (parseInt(soTrang) < 0 || parseInt(nxb) < 0) {
    return res.send("Phải > 0");
  } else {
    docClient.put(params, function (err, data) {
      if (err) {
        return res.send(err);
      } else {
        return res.redirect("/");
      }
    });
  }
});

app.post("/delete", upload.fields([]), function (req, res) {
  const listItem = Object.keys(req.body);

  if (listItem.length == 0) {
    return res.redirect("/");
  }

  function OnDeleteItems(index) {
    const params = {
      TableName: tableName,
      Key: {
        idBaiBao: listItem[index],
      },
    };

    docClient.delete(params, function (err, data) {
      if (err) {
        return res.send("Delete Err");
      } else {
        if (index > 0) {
          OnDeleteItems(index - 1);
        } else {
          return res.redirect("/");
        }
      }
    });
  }

  OnDeleteItems(listItem.length - 1);
});

app.post("/deleteOne", upload.fields([]), function (req, res) {
  const idBaiBao = Object.keys(req.body);

  const params = {
    TableName: tableName,
    Key: {
      idBaiBao: idBaiBao[0],
    },
  };

  docClient.delete(params, function (err, data) {
    if (err) {
      console.log(idBaiBao);
      return res.send("Delete Err: " + err + idBaiBao);
    } else {
      return res.redirect("/");
    }
  });
});

app.listen(3000);
