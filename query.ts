import { gql } from '@urql/core';

export const USER = gql`
    query {
        viewer {
            login
            bio
        }
    }
`;
