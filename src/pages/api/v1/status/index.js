function status(request, response) {
  const updatedAt = new Date().toISOString();

  // Must implement Prisma ORM before proceeding
  // database.query

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {},
    },
  });
}

export default status;
