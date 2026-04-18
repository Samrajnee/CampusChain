const errorHandler = (err, req, res, next) => {
  console.error(err)

  const status = err.status || 500
  const message = err.message || 'Internal server error'

  return res.status(status).json({ success: false, message })
}

export default errorHandler