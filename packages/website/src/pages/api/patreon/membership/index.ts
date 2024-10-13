import { assertSecret } from '@blitzkit/core';
import type { APIContext } from 'astro';

export const prerender = false;

interface PatreonMembershipResponse {
  data: {
    attributes: unknown;
    id: `${number}`;
    relationships: {
      memberships: {
        data: {
          id: string; // uuid
          type: 'member';
        }[];
      };
    };
    type: 'user';
  };
  included?: (
    | {
        attributes: {
          patron_status:
            | 'active_patron'
            | 'declined_patron'
            | 'former_patron'
            | null; // null = never a paid member
        };
        id: string; // uuid
        relationships: {
          campaign: {
            data: {
              id: `${number}`; // id of my campaign to check against
              type: 'campaign';
            };
            links: {
              related: string; // url
            };
          };
        };
        type: 'member';
      }
    | {
        attributes: {};
        id: `${number}`;
        type: 'campaign'; // ignore this discriminator
      }
  )[];
  links: {
    self: 'https://www.patreon.com/api/oauth2/v2/user/124201389';
  };
}

export async function GET({ request }: APIContext) {
  const token = request.headers.get('token');

  if (!token) return Response.json(false);

  console.log('doing it');

  const patreonResponse = await fetch(
    encodeURI(
      'https://www.patreon.com/api/oauth2/v2/identity?include=memberships.campaign&fields[member]=patron_status',
    ),
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!patreonResponse.ok) return Response.json(false);

  const json = (await patreonResponse.json()) as PatreonMembershipResponse;

  const response = Response.json(
    json.included?.some(
      (item) =>
        item.type === 'member' &&
        item.relationships.campaign.data.id ===
          assertSecret(process.env.PATREON_CAMPAIGN_ID) &&
        item.attributes.patron_status === 'active_patron',
    ) ?? false,
  );

  response.headers.set('Cache-Control', 'max-age=86400'); // a day

  return response;
}
