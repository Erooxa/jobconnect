import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        firstName
        lastName
        role
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        firstName
        lastName
        role
      }
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      firstName
      lastName
      role
      phone
      avatar
      bio
      skills
      experience
      location
    }
  }
`;

export const GET_JOBS = gql`
  query GetJobs($filters: JobFilters, $limit: Int, $offset: Int) {
    jobs(filters: $filters, limit: $limit, offset: $offset) {
      id
      title
      description
      requirements
      salaryMin
      salaryMax
      currency
      employmentType
      location
      remote
      status
      company {
        id
        name
        logo
        location
      }
      category
      experienceLevel
      skills
      applicationsCount
      viewsCount
      createdAt
    }
  }
`;

export const GET_JOB = gql`
  query GetJob($id: ID!) {
    job(id: $id) {
      id
      title
      description
      requirements
      salaryMin
      salaryMax
      currency
      employmentType
      location
      remote
      status
      company {
        id
        name
        description
        logo
        website
        industry
        size
        location
      }
      category
      experienceLevel
      skills
      applicationsCount
      viewsCount
      createdAt
    }
  }
`;

export const GET_MY_JOBS = gql`
  query GetMyJobs($status: JobStatus, $limit: Int, $offset: Int) {
    myJobs(status: $status, limit: $limit, offset: $offset) {
      id
      title
      description
      requirements
      salaryMin
      salaryMax
      currency
      employmentType
      location
      remote
      status
      company {
        id
        name
      }
      category
      experienceLevel
      skills
      applicationsCount
      viewsCount
      createdAt
    }
  }
`;

export const CREATE_JOB = gql`
  mutation CreateJob($input: CreateJobInput!) {
    createJob(input: $input) {
      id
      title
      description
      status
    }
  }
`;

export const PUBLISH_JOB = gql`
  mutation PublishJob($id: ID!) {
    publishJob(id: $id) {
      id
      status
    }
  }
`;

export const GET_MY_APPLICATIONS = gql`
  query GetMyApplications($status: ApplicationStatus, $limit: Int, $offset: Int) {
    myApplications(status: $status, limit: $limit, offset: $offset) {
      id
      job {
        id
        title
        company {
          id
          name
          logo
        }
      }
      status
      coverLetter
      createdAt
    }
  }
`;

export const CREATE_APPLICATION = gql`
  mutation CreateApplication($input: CreateApplicationInput!) {
    createApplication(input: $input) {
      id
      status
      job {
        id
        title
      }
    }
  }
`;

export const GET_JOB_APPLICATIONS = gql`
  query GetJobApplications($jobId: ID!, $status: ApplicationStatus, $limit: Int, $offset: Int) {
    jobApplications(jobId: $jobId, status: $status, limit: $limit, offset: $offset) {
      id
      candidate {
        id
        firstName
        lastName
        email
        skills
        experience
      }
      coverLetter
      status
      notes
      reviewedBy {
        id
        firstName
        lastName
      }
      reviewedAt
      createdAt
    }
  }
`;

export const UPDATE_APPLICATION = gql`
  mutation UpdateApplication($id: ID!, $input: UpdateApplicationInput!) {
    updateApplication(id: $id, input: $input) {
      id
      status
      notes
    }
  }
`;

export const GET_MY_COMPANY = gql`
  query GetMyCompany {
    myCompany {
      id
      name
      description
      website
      logo
      industry
      size
      location
      foundedYear
      owner {
        id
        firstName
        lastName
      }
    }
  }
`;

export const CREATE_COMPANY = gql`
  mutation CreateCompany($input: CreateCompanyInput!) {
    createCompany(input: $input) {
      id
      name
      description
    }
  }
`;

export const JOB_CREATED_SUBSCRIPTION = gql`
  subscription JobCreated {
    jobCreated {
      id
      title
      description
      company {
        id
        name
      }
      createdAt
    }
  }
`;

export const APPLICATION_STATUS_CHANGED_SUBSCRIPTION = gql`
  subscription ApplicationStatusChanged {
    applicationStatusChanged {
      id
      status
      job {
        id
        title
      }
      candidate {
        id
        firstName
        lastName
      }
    }
  }
`;

