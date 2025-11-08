const db = require("../models");

const Media = db.Media;

const { Op } = db.Sequelize;

// READ ALL (Public Access)
exports.findAll = async (req, res) => {
  try {
    const media = await Media.findAll();
    res.status(200).send(media);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error retrieving media." });
  }
};

// READ ONE (Public Access)
exports.findOne = async (req, res) => {
  const id_media = req.params.id_media;
  try {
    const media = await Media.findByPk(id_media);
    if (!media) {
      return res.status(404).send({ message: `Media not found with id_media=${id_media}` });
    }
    res.status(200).send(media);
  } catch (err) {
    res.status(500).send({ message: "Error retrieving media with id_media=" + id_media });
  }
};

// CREATE (Admin Only)
exports.create = async (req, res) => {
  if (!req.body.judul || !req.body.genre || !req.body.tahun_rilis) {
    return res.status(400).send({ message: "Kolom judul, genre, dan tahun_rilis wajib diisi!" });
  }
  const mediaData = {
    judul: req.body.judul,
    genre: req.body.genre,
    tahun_rilis: req.body.tahun_rilis,
  };
  try {
    const media = await Media.create(mediaData);
    res.status(201).send(media);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error creating media." });
  }
};

// UPDATE (Admin Only)
exports.update = async (req, res) => {
  const id_media = req.params.id_media;
  const validUpdates = {};
  if (req.body.judul) validUpdates.judul = req.body.judul;
  if (req.body.genre) validUpdates.genre = req.body.genre;
  if (req.body.tahun_rilis) validUpdates.tahun_rilis = req.body.tahun_rilis;
  try {
    const [num] = await Media.update(validUpdates, {
      where: { id_media: id_media },
    });
    if (num === 1) {
      res.send({ message: "Data media berhasil diperbarui." });
    } else {
      res.status(404).send({
        message: `Media tidak ditemukan atau tidak dapat diupdate dengan id_media=${id_media}`,
      });
    }
  } catch (err) {
    res.status(500).send({ message: "Terjadi kesalahan saat update media dengan id_media=" + id_media });
  }
};

// DELETE (Admin Only)
exports.delete = async (req, res) => {
  const id_media = req.params.id_media;
  try {
    const num = await Media.destroy({
      where: { id_media: id_media },
    });
    if (num === 1) {
      res.send({ message: "Data media berhasil dihapus!" });
    } else {
      res.status(404).send({
        message: `Media tidak ditemukan atau tidak dapat dihapus dengan id_media=${id_media}`,
      });
    }
  } catch (err) {
    res.status(500).send({ message: "Terjadi kesalahan saat menghapus media dengan id_media=" + id_media });
  }
};
