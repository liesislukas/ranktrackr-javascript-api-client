var request = require('request');

import {config} from './../config/config';

const ranktrackr_make_call = ({method, api_endpoint, form}) => {
  return new Promise((resolve, reject) => {
    request[method](
      `${config.ranktrackr.api_url}${api_endpoint}`,
      {
        form,
      },
      function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          let parsed_json = JSON.parse(body);
          resolve(parsed_json);
        }
      }
    );
  });
};

const ranktrackr_get_access_token = () => {

  return new Promise((resolve, reject) => {

    ranktrackr_make_call(
      {
        method: 'post',
        api_endpoint: '/token',
        form: {
          email: config.ranktrackr.email,
          password: config.ranktrackr.password,
        }
      }
    )
      .then(response => {
        resolve(response.access_token);
      })
    ;
  });

};

const ranktrackr_get_groups = () => {

  return new Promise((resolve, reject) => {
    ranktrackr_get_access_token()
      .then(access_token => {
        ranktrackr_make_call(
          {
            method: 'get',
            api_endpoint: '/url_groups',
            form: {
              access_token
            }
          }
        )
          .then(groups => {
            let results = [];
            Object.keys(groups).forEach(group => results.push({id: groups[group].id, name: groups[group].name}));
            resolve(results);
          })
        ;
      });
  });
};

const ranktrackr_add_group = ({name}) => {

  return new Promise((resolve, reject) => {
    ranktrackr_get_access_token()
      .then(access_token => {
        ranktrackr_make_call(
          {
            method: 'post',
            api_endpoint: '/url_groups',
            form: {
              access_token,
              url_group: {
                name,
              }
            }

          }
        )
          .then(response => {
            if (response.id && response.name) {
              resolve({id: response.id, name: response.name});
            } else {
              reject(response);
            }
          })
        ;
      });
  });
};


const ranktrackr_delete_group = ({group_id}) => {
  return new Promise((resolve, reject) => {
    ranktrackr_get_access_token()
      .then(access_token => {
        ranktrackr_make_call(
          {
            method: 'delete',
            api_endpoint: `/url_groups/${group_id}`,
            form: {
              access_token,
            }
          }
        )
          .then(response => {
            if (response.error) {
              reject(response);
            } else {
              resolve(response);
            }
          });
      });
  });
};
