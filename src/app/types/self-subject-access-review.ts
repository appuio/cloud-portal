export class SelfSubjectAccessReview {
  readonly kind = 'SelfSubjectAccessReview';
  readonly apiVersion = 'authorization.k8s.io/v1';
  readonly spec = {
    resourceAttributes: {
      namespace: 'default',
      verb: '',
      resource: '',
    },
  };
  readonly status?: {
    allowed: boolean;
    reason: string;
  };

  constructor(verb: string, resource: string) {
    this.spec.resourceAttributes.verb = verb;
    this.spec.resourceAttributes.resource = resource;
  }
}
