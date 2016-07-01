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

const ranktrackr_get_urls = () => {
  return new Promise((resolve, reject) => {
    ranktrackr_get_access_token()
      .then(access_token => {
        ranktrackr_make_call(
          {
            method: 'get',
            api_endpoint: '/urls',
            form: {
              access_token
            }
          }
        )
          .then(urls => {
            let results = [];
            Object.keys(urls).forEach(url => results.push({id: urls[url].id, url: urls[url].url}));
            resolve(results);
          })
        ;
      });
  });
};

const ranktrackr_add_urls = ({urls, group_id, url_type}) => {
  return new Promise((resolve, reject) => {
    ranktrackr_get_access_token()
      .then(access_token => {
        ranktrackr_make_call(
          {
            method: 'post',
            api_endpoint: '/urls/batch_create',
            form: {
              urls,
              group_id,
              url_type,
              access_token
            }
          }
        )
          .then(response => {
            resolve(response);
          })
        ;
      });
  });
};

const ranktrackr_delete_url = ({url_id}) => {
  return new Promise((resolve, reject) => {
    ranktrackr_get_access_token()
      .then(access_token => {
        ranktrackr_make_call(
          {
            method: 'delete',
            api_endpoint: `/urls/${url_id}`,
            form: {
              access_token
            }
          }
        )
          .then(response => {
            resolve(response);
          })
        ;
      });
  });
};

const ranktrackr_get_keywords = ({url_id}) => {
  return new Promise((resolve, reject) => {
    ranktrackr_get_access_token()
      .then(access_token => {
        ranktrackr_make_call(
          {
            method: 'get',
            api_endpoint: `/urls/${url_id}/keywords`,
            form: {
              access_token
            }
          }
        )
          .then(keywords => {
            let results = [];
            Object.keys(keywords).forEach(keyword =>
              results.push(
                {
                  id: keywords[keyword].id,
                  keyword: keywords[keyword].query,
                  uri: keywords[keyword].uri,
                  url: keywords[keyword].result_url,
                  mini_graph_uri: keywords[keyword].mini_graph,
                }
              )
            );
            resolve(results);
          })
        ;
      });
  });
};


export {
  ranktrackr_get_groups,
  ranktrackr_add_group,
  ranktrackr_delete_group,
  ranktrackr_get_urls,
  ranktrackr_add_urls,
  ranktrackr_delete_url,
  ranktrackr_get_keywords,
};
