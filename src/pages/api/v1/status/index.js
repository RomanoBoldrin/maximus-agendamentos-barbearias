function status(request, response) {
  response.status(200).json({
    Status: "Everything ok",
  });
}

export default status;
