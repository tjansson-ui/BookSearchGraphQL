const express = require('express');
const path = require('path');
const db = require('./config/connection');
const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')

const app = express();
const PORT = process.env.PORT || 3001;

const { typeDefs, resolvers } = require('./schemas')
const { authMiddleware } = require('./utils/auth')

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
  persistedQueries: false
})

const startApolloServer = async (typeDefs, resolvers) => {
  await apolloServer.start()

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }

  app.use('/graphql', expressMiddleware(apolloServer, {
    context: authMiddleware
  }))

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`Live on http://localhost:${PORT}`)
      console.log(`GraphQL at http://localhost:${PORT}/graphql`)

    })
  })

};

startApolloServer()