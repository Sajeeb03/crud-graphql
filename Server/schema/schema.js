const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLSchema, GraphQLList, GraphQLNonNull, GraphQLEnumType } = require('graphql');
const Project = require("../models/Project");
const Client = require("../models/Client");

//client type
const ClientType = new GraphQLObjectType({
    name: "client",
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString }
    })
});

//project type
const ProjectType = new GraphQLObjectType({
    name: "project",
    fields: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        status: { type: GraphQLString },
        client: {
            type: ClientType,
            resolve(parent, args) {
                return Client.findById(parent.clientId)
            }
        }
    }
})


const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        projects: {
            type: GraphQLList(ProjectType),
            resolve(parent, args) {
                return Project.find();
            }
        },

        project: {
            type: ProjectType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return Project.findById(args.id)
            }
        },
        clients: {
            type: GraphQLList(ClientType),
            resolve(parent, args) {
                return Client.find();
            }
        },
        client: {
            type: ClientType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return Client.findById(args.id)
            }
        }
    }
})

//mutation
const mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        //add client
        addClient: {
            type: ClientType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                email: { type: GraphQLNonNull(GraphQLString) },
                phone: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve(parent, args) {
                const client = new Client({
                    name: args.name,
                    email: args.email,
                    phone: args.phone
                });
                return client.save();
            }
        },
        //delete client
        deleteClient: {
            type: ClientType,
            args: { id: { type: GraphQLNonNull(GraphQLString) } },
            resolve(parent, args) {
                return Client.findByIdAndRemove(args.id)
            }
        },
        //add product
        addProject: {
            type: ProjectType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                description: { type: GraphQLNonNull(GraphQLString) },
                status: {
                    type: new GraphQLEnumType({
                        name: "ProjectStatus",
                        values: {
                            'new': { value: "Not started" },
                            'progress': { value: "In Progress" },
                            'completed': { value: "Completed" }
                        }
                    }),
                    defaultValue: "Not started"
                },
                clientId: {
                    type: GraphQLNonNull(GraphQLID)
                },

            },
            resolve(parent, args) {
                const project = new Project({
                    name: args.name,
                    description: args.description,
                    status: args.status,
                    clientId: args.clientId
                });
                return project.save();
            }
        },
        // delete project
        deleteProject: {
            type: ProjectType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                return Project.findByIdAndRemove(args.id)
            }
        },
        //update project
        updateProject: {
            type: ProjectType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) },
                name: { type: GraphQLString },
                description: { type: GraphQLString },
                status: {
                    type: new GraphQLEnumType({
                        name: "ProjectStatusUpdated",
                        values: {
                            'new': { value: "Not started" },
                            'progress': { value: "In Progress" },
                            'completed': { value: "Completed" }
                        }
                    })
                },
            },
            resolve(parent, args) {

                return Project.findByIdAndUpdate(args.id, {
                    $set: {
                        name: args.name,
                        description: args.description,
                        status: args.status
                    }
                },
                    { new: true }
                );
            }
        }
    }

})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
})