export class SelfSubjectAccessReview {
  readonly kind = 'SelfSubjectAccessReview';
  readonly apiVersion = 'authorization.k8s.io/v1';
  readonly spec = {
    resourceAttributes: {
      namespace: 'default',
      verb: '',
      resource: '',
      group: '',
    },
  };
  readonly status = {
    allowed: false,
    reason: '',
  };

  constructor(verb: string, resource: string, group: string) {
    this.spec.resourceAttributes.verb = verb;
    this.spec.resourceAttributes.resource = resource;
    this.spec.resourceAttributes.group = group;
  }
}
