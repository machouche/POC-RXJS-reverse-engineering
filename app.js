class Observable {
    constructor(notifier) {
      this.subscribe = notifier;
      this.subs = [];
    }
  
    static fromEvent(element, name) {
      return new Observable(observer => {
        const callback = event => observer.next(event);
        element.addEventListener(name, callback, false);
        return _ => element.removeEventListener(name, callback, false);
      });
    }
  
    static of(...args) {
      return new Observable(observer => {
        args.forEach(value => observer.next(value));
        return _ => console.log('triggered');
      });
    }
    static interval(duration) {
      return new Observable(observer => {
        let val = 0;
        const interval = setInterval(_ => {
          observer.next(val++);
        }, duration);
        return _ => clearInterval(interval);
      });
    }
  
    filter(callback) {
      return new Observable(observer =>
        this.subscribe({
          next: val => {
            if (callback(val)) {
              observer.next(val);
            }
          }
        })
      );
    }
  
    map(callback) {
      return new Observable(observer =>
        this.subscribe({
          next: val => observer.next(callback(val))
        })
      );
    }
  
    mergeMap(callback) {
      return new Observable(observer => {
        return this.subscribe({
          next: val => {
            const subscribtion = callback(val).subscribe({
              next: inner => observer.next(inner)
            });
          }
        });
      });
    }
    switchMap(callback) {
      return new Observable(observer => {
        return this.subscribe({
          next: val => {
            this.subs.forEach(sub => sub());
            const subscribtion = callback(val).subscribe({
              next: inner => observer.next(inner)
            });
            this.subs.push(subscribtion);
          }
        });
      });
    }
  
    // not working as intended
    take(value) {
      let counter = 0;
      return new Observable(observer => {
        const subscribtion = this.subscribe({
          next: val => {
            if (counter < value) {
              observer.next(val);
              console.log('EMIT QUAND MEME');
              counter++;
            } else {
              console.log('AAAA');
            }
          }
        });
      });
    }
  
    // not working as intended
    combineLatest(observable) {
      return new Observable(observer =>
        this.subscribe({
          next: val => {
            return observable.subscribe({
              next: inner => observer.next([val, inner])
            });
          }
        })
      );
    }
  }
  
  const notifier = observer => {
    let index = 0;
    const inter = setInterval(_ => {
      observer.next(index++);
    }, 400);
    return _ => clearInterval(inter);
  };
  // const observable = new Observable(notifier);
  
  // const observable = Observable.of(1, 2, 3);
  const observable1 = Observable.of('hello1:', 'hello2:', 'hello3:');
  const observable2 = Observable.of('A', 'B', 'C');
  
  // const subscribtion = observable1
  //   .mergeMap(val => Observable.interval(1000).map(interval => val + interval))
  //   .take(3)
  //   .subscribe({
  //     next: val => console.log(`[${val}]`)
  //   });
  const { of, interval } = Observable;
  
  // of('a', 'b', 'c')
  //   .switchMap(x => interval(1000).map(i => x + i))
  //   .take(4)
  //   .subscribe({ next: val => console.log(val) });
  
  // const subscribtion = observable1
  //   .mergeMap(val => Observable.of('1', '2', '3').map(inner => val + inner))
  //   .subscribe({
  //     next: val => console.log(`[${val}]`)
  //   });
  // const subscribtion = observable1
  //   .combineLatest(observable2)
  //   .map(([first, second]) => `${first} ${second}`)
  //   .subscribe({
  //     next: val => console.log('valLog: ', val)
  //   });
  
  const subscribtion = Observable.interval(2000)
    .mergeMap(() => Observable.interval(900))
    .subscribe({
      next: val => console.log(val)
    });
  
  setTimeout(_ => subscribtion(), 10000);
  